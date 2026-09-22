require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Collection,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { pointInfoText } = require("./rules.js");
const { getDueUnbans, clearUnban } = require("./moderation/store.js");
const { OFFENSES } = require("./moderation/config.js");
const { getPending, deletePending } = require("./moderation/pending.js");
const { applyBypassBan, applyPointWarning } = require("./moderation/applyWarn.js");

// Every department's rule list, keyed by the deptKey used in that
// department's command file (must match what's passed to buildRulesContainer).
const departmentRules = {
  security: require("./rules.js").rules,
  research: require("./departments/research.js").rules,
  medical: require("./departments/medical.js").rules,
  technical: require("./departments/technical.js").rules,
  janitor: require("./departments/janitor.js").rules,
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Load slash commands from /commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  processDueUnbans(); // catch up on anything missed while offline
  setInterval(processDueUnbans, 5 * 60 * 1000); // then check every 5 minutes
});

// Automatically lifts any 7-day bans (scheduled by /warn) once their time is up.
async function processDueUnbans() {
  const due = getDueUnbans();
  for (const entry of due) {
    try {
      const guild = await client.guilds.fetch(entry.guildId);
      await guild.members.unban(entry.userId, "7-day ban expired");
      console.log(`Auto-unbanned ${entry.userId} in guild ${entry.guildId}`);
    } catch (err) {
      console.error(`Failed to auto-unban ${entry.userId}:`, err.message);
    } finally {
      clearUnban(entry.guildId, entry.userId, entry.unbanAt);
    }
  }
}

client.on("interactionCreate", async (interaction) => {
  try {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const requiredPermission = {
        ban: PermissionFlagsBits.BanMembers,
        hackban: PermissionFlagsBits.BanMembers,
        unban: PermissionFlagsBits.BanMembers,
        clearwarnings: PermissionFlagsBits.ModerateMembers,
        jail: PermissionFlagsBits.ModerateMembers,
        mute: PermissionFlagsBits.ModerateMembers,
        timeout: PermissionFlagsBits.ModerateMembers,
        unjail: PermissionFlagsBits.ModerateMembers,
        unmute: PermissionFlagsBits.ModerateMembers,
        warn: PermissionFlagsBits.ModerateMembers,
        warnings: PermissionFlagsBits.ModerateMembers,
      }[interaction.commandName];

      if (requiredPermission && !interaction.memberPermissions?.has(requiredPermission)) {
        await interaction.reply({
          content: "You can see this command, but you do not have permission to use it.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await command.execute(interaction);
      return;
    }

    // Rule dropdown selection - customId looks like "rules_select:security"
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith("rules_select:")) {
      const deptKey = interaction.customId.split(":")[1];
      const rules = departmentRules[deptKey];

      const chosen = rules && rules.find((r) => r.value === interaction.values[0]);
      if (!chosen) {
        await interaction.reply({
          content: "Couldn't find that rule. Try again.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const bulletText = chosen.bullets.map((b) => `> • ${b}`).join("\n");

      const container = new ContainerBuilder()
        .setAccentColor(0x000000)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${chosen.title}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(bulletText));

      await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    // Point Info button - shared across every department
    if (interaction.isButton() && interaction.customId === "point_info") {
      const container = new ContainerBuilder()
        .setAccentColor(0x000000)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(pointInfoText));

      await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
      return;
    }

    // /warn confirmation - "Yes, do it"
    if (interaction.isButton() && interaction.customId.startsWith("warn_confirm:")) {
      const token = interaction.customId.split(":")[1];
      const pendingAction = getPending(token);

      if (!pendingAction) {
        await interaction.reply({
          content: "This confirmation has expired. Please run /warn again.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      deletePending(token);

      await interaction.deferUpdate();

      const guild = await client.guilds.fetch(pendingAction.guildId);
      const targetUser = await client.users.fetch(pendingAction.targetUserId);
      const offense = OFFENSES[pendingAction.offenseKey];

      let resultText;
      try {
        if (offense.bypass) {
          resultText = await applyBypassBan({
            client,
            guild,
            targetUser,
            offense,
            reason: pendingAction.reason,
            moderatorTag: pendingAction.moderatorTag,
          });
        } else {
          resultText = await applyPointWarning({
            client,
            guild,
            targetUser,
            offense,
            reason: pendingAction.reason,
            moderatorId: pendingAction.moderatorId,
            moderatorTag: pendingAction.moderatorTag,
          });
        }
      } catch (err) {
        resultText = `Something went wrong applying this action: ${err.message}`;
      }

      const container = new ContainerBuilder()
        .setAccentColor(0x000000)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("# WARNING APPLIED"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(resultText));

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // /warn confirmation - "No, cancel"
    if (interaction.isButton() && interaction.customId.startsWith("warn_cancel:")) {
      const token = interaction.customId.split(":")[1];
      deletePending(token);

      const container = new ContainerBuilder()
        .setAccentColor(0x000000)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("# CANCELLED"))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("No action was taken."));

      await interaction.update({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }
  } catch (err) {
    console.error("Interaction error:", err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Something went wrong. Please try again.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

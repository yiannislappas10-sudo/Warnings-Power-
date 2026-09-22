const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { OFFENSES } = require("../moderation/config.js");
const { getActionForPoints } = require("../moderation/escalate.js");
const { getUser } = require("../moderation/store.js");
const { createPending } = require("../moderation/pending.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member and apply points toward the escalation ladder.")
    .setDefaultMemberPermissions(null)
    .addUserOption((o) => o.setName("user").setDescription("Member to warn").setRequired(true))
    .addStringOption((o) =>
      o
        .setName("offense")
        .setDescription("Type of offense")
        .setRequired(true)
        .addChoices(
          { name: "Minor rule break (+1)", value: "minor" },
          { name: "Repeated minor breaks (+2)", value: "repeated_minor" },
          { name: "Moderate offense (+3)", value: "moderate" },
          { name: "Serious offense (+5)", value: "serious" },
          { name: "Extreme offense (immediate ban)", value: "extreme" },
          { name: "Ban evasion / repeat ban (permanent ban)", value: "evasion" }
        )
    )
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const offenseKey = interaction.options.getString("offense");
    const reason = interaction.options.getString("reason");
    const offense = OFFENSES[offenseKey];
    const guild = interaction.guild;

    let previewText;
    if (offense.bypass) {
      const permanent = offense.bypass === "permanent_ban";
      previewText =
        `**Target:** ${targetUser.tag}\n**Offense:** ${offense.label}\n**Reason:** ${reason}\n\n` +
        `This will **${permanent ? "permanently" : "immediately"} ban** ${targetUser.tag}. ` +
        `This bypasses the point ladder entirely.`;
    } else {
      const current = getUser(guild.id, targetUser.id);
      const newTotal = current.points + offense.points;
      const tier = getActionForPoints(newTotal);
      const actionPreview = tier ? tier.label : "No automatic action (below first threshold)";
      previewText =
        `**Target:** ${targetUser.tag}\n**Offense:** ${offense.label} (+${offense.points})\n**Reason:** ${reason}\n\n` +
        `Current points: **${current.points}** → New total: **${newTotal}**\n` +
        `Resulting action: **${actionPreview}**`;
    }

    const token = createPending({
      guildId: guild.id,
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetUserId: targetUser.id,
      offenseKey,
      reason,
    });

    const container = new ContainerBuilder()
      .setAccentColor(0x000000)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("# CONFIRM WARNING"))
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(previewText))
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("**Should we do it or not?**"))
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`warn_confirm:${token}`)
            .setLabel("Yes, do it")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`warn_cancel:${token}`)
            .setLabel("No, cancel")
            .setStyle(ButtonStyle.Secondary)
        )
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  },
};

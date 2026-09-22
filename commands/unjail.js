const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { JAILED_ROLE_ID, JAIL_CHANNEL_ID } = require("../moderation/config.js");
const { getJailState, clearJailState } = require("../moderation/store.js");
const { sendModLog } = require("../utils/modlog.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unjail")
    .setDescription("Restore a member's previous roles and remove jail restrictions.")
    .setDefaultMemberPermissions(null)
    .addUserOption((o) => o.setName("user").setDescription("Member to unjail").setRequired(true)),

  async execute(interaction) {
    if (!JAILED_ROLE_ID || !JAIL_CHANNEL_ID) {
      await interaction.reply({
        content: "JAILED_ROLE_ID and JAIL_CHANNEL_ID must be configured before using /unjail.",

      });
      return;
    }

    const targetUser = interaction.options.getUser("user");
    await interaction.deferReply();
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    const me = interaction.guild.members.me;
    if (!member || !me) {
      await interaction.editReply("Couldn't find that member or the bot member.");
      return;
    }

    const state = getJailState(interaction.guild.id, member.id);
    try {
      await member.roles.remove(JAILED_ROLE_ID, "Member unjailed");
      if (state?.roleIds?.length) {
        const roles = await Promise.all(
          state.roleIds.map((id) => interaction.guild.roles.fetch(id).catch(() => null))
        );
        const restorableRoles = roles.filter(
          (role) => role && !role.managed && role.position < me.roles.highest.position
        );
        if (restorableRoles.length) {
          await member.roles.add(restorableRoles, "Restore roles after jail");
        }
      }
      const channels = await interaction.guild.channels.fetch();
      for (const channel of channels.values()) {
        if (!channel?.isTextBased() || !channel.permissionOverwrites) continue;
        await channel.permissionOverwrites.delete(member.id, "Remove jail channel restrictions");
      }
      clearJailState(interaction.guild.id, member.id);
    } catch (err) {
      await interaction.editReply(`Couldn't unjail this user completely: ${err.message}`);
      return;
    }

    await sendModLog(interaction.client, {
      action: "🔓 Unjail",
      target: `${targetUser.tag} (${targetUser.id})`,
      moderator: `${interaction.user.tag}`,
      reason: "—",
    });
    const restoreNote = state
      ? "their saved roles were restored"
      : "no saved role snapshot was found, so roles must be restored manually";
    await interaction.editReply(`${targetUser.tag} has been unjailed; ${restoreNote}.`);
  },
};

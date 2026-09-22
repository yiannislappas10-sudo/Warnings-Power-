const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { JAILED_ROLE_ID, JAIL_CHANNEL_ID } = require("../moderation/config.js");
const { getJailState, clearJailState } = require("../moderation/store.js");
const { sendModLog } = require("../utils/modlog.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unjail")
    .setDescription("Restore a member's previous roles and remove jail restrictions.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("user").setDescription("Member to unjail").setRequired(true)),

  async execute(interaction) {
    if (!JAILED_ROLE_ID || !JAIL_CHANNEL_ID) {
      await interaction.reply({
        content: "JAILED_ROLE_ID and JAIL_CHANNEL_ID must be configured before using /unjail.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user");
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
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
        const roles = state.roleIds
          .map((id) => interaction.guild.roles.cache.get(id))
          .filter((role) => role && !role.managed && role.position < me.roles.highest.position);
        if (roles.length) await member.roles.add(roles, "Restore roles after jail");
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
    await interaction.editReply(`${targetUser.tag} has been unjailed and their previous roles were restored.`);
  },
};

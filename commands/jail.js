const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { JAILED_ROLE_ID, JAIL_CHANNEL_ID } = require("../moderation/config.js");
const { saveJailState } = require("../moderation/store.js");
const { sendModLog } = require("../utils/modlog.js");

async function setJailChannelAccess(guild, memberId, allow) {
  if (!JAIL_CHANNEL_ID) return;
  const jailChannel = await guild.channels.fetch(JAIL_CHANNEL_ID).catch(() => null);
  if (!jailChannel || !jailChannel.isTextBased()) {
    throw new Error("JAIL_CHANNEL_ID does not point to a text-based channel.");
  }

  const channels = await guild.channels.fetch();
  for (const channel of channels.values()) {
    if (!channel || !channel.isTextBased() || !channel.permissionOverwrites) continue;
    await channel.permissionOverwrites.edit(memberId, {
      ViewChannel: allow ? null : false,
      SendMessages: allow ? null : false,
      AddReactions: allow ? null : false,
      ReadMessageHistory: allow ? null : false,
    }, { reason: allow ? "Member unjailed" : "Member jailed" });
  }
  await jailChannel.permissionOverwrites.edit(memberId, {
    ViewChannel: allow ? null : true,
    SendMessages: allow ? null : true,
    AddReactions: allow ? null : true,
    ReadMessageHistory: allow ? null : true,
  }, { reason: allow ? "Member unjailed" : "Member jailed" });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jail")
    .setDescription("Remove a member's roles and restrict them to the jail channel.")
    .setDefaultMemberPermissions(null)
    .addUserOption((o) => o.setName("user").setDescription("Member to jail").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(true)),

  async execute(interaction) {
    if (!JAILED_ROLE_ID || !JAIL_CHANNEL_ID) {
      await interaction.reply({
        content: "JAILED_ROLE_ID and JAIL_CHANNEL_ID must be configured before using /jail.",

      });
      return;
    }

    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    await interaction.deferReply();

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    const me = interaction.guild.members.me;
    if (!member || !me) {
      await interaction.editReply("Couldn't find that member or the bot member.");
      return;
    }
    if (member.id === me.id || member.roles.highest.position >= me.roles.highest.position) {
      await interaction.editReply("I cannot safely jail this member because of role hierarchy.");
      return;
    }

    const jailChannel = await interaction.guild.channels.fetch(JAIL_CHANNEL_ID).catch(() => null);
    if (!jailChannel || !jailChannel.isTextBased()) {
      await interaction.editReply("JAIL_CHANNEL_ID does not point to a text-based channel.");
      return;
    }

    const removableRoles = member.roles.cache.filter(
      (role) => role.id !== interaction.guild.id && !role.managed && role.position < me.roles.highest.position
    );
    const removableRoleList = [...removableRoles.values()];
    const savedRoleIds = removableRoleList.map((role) => role.id);

    try {
      saveJailState(interaction.guild.id, member.id, savedRoleIds);
      await member.roles.remove(removableRoleList, reason);
      await member.roles.add(JAILED_ROLE_ID, reason);
      await setJailChannelAccess(interaction.guild, member.id, false);
    } catch (err) {
      await interaction.editReply(`Couldn't jail this user safely: ${err.message}`);
      return;
    }

    await sendModLog(interaction.client, {
      action: "🔒 Jail",
      target: `${targetUser.tag} (${targetUser.id})`,
      moderator: `${interaction.user.tag}`,
      reason,
    });
    await interaction.editReply(`${targetUser.tag} has been jailed and restricted to <#${JAIL_CHANNEL_ID}>.`);
  },
};

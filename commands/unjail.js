const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { JAILED_ROLE_ID } = require("../moderation/config.js");
const { sendModLog } = require("../utils/modlog.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unjail")
    .setDescription("Remove a member's Jailed role.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("user").setDescription("Member to unjail").setRequired(true)),

  async execute(interaction) {
    if (!JAILED_ROLE_ID) {
      await interaction.reply({
        content: "JAILED_ROLE_ID isn't set yet — add it as an env var or in moderation/config.js.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      await interaction.editReply("Couldn't find that member in this server.");
      return;
    }

    try {
      await member.roles.remove(JAILED_ROLE_ID);
    } catch (err) {
      await interaction.editReply(`Couldn't unjail this user: ${err.message}`);
      return;
    }

    await sendModLog(interaction.client, {
      action: "🔓 Unjail",
      target: `${targetUser.tag} (${targetUser.id})`,
      moderator: `${interaction.user.tag}`,
      reason: "—",
    });

    await interaction.editReply(`${targetUser.tag} has been unjailed.`);
  },
};

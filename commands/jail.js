const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { JAILED_ROLE_ID } = require("../moderation/config.js");
const { sendModLog } = require("../utils/modlog.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jail")
    .setDescription("Give a member the Jailed role (indefinite, until /unjail).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("user").setDescription("Member to jail").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(true)),

  async execute(interaction) {
    if (!JAILED_ROLE_ID) {
      await interaction.reply({
        content: "JAILED_ROLE_ID isn't set yet — add it as an env var or in moderation/config.js.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      await interaction.editReply("Couldn't find that member in this server.");
      return;
    }

    try {
      await member.roles.add(JAILED_ROLE_ID, reason);
    } catch (err) {
      await interaction.editReply(`Couldn't jail this user: ${err.message}`);
      return;
    }

    await sendModLog(interaction.client, {
      action: "🔒 Jail",
      target: `${targetUser.tag} (${targetUser.id})`,
      moderator: `${interaction.user.tag}`,
      reason,
    });

    await interaction.editReply(`${targetUser.tag} has been jailed.`);
  },
};

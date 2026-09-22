const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { sendModLog } = require("../utils/modlog.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user by ID.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((o) => o.setName("userid").setDescription("The user's Discord ID").setRequired(true)),

  async execute(interaction) {
    const userId = interaction.options.getString("userid");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!/^\d{15,25}$/.test(userId)) {
      await interaction.editReply("That doesn't look like a valid Discord user ID.");
      return;
    }

    try {
      await interaction.guild.members.unban(userId);
    } catch (err) {
      await interaction.editReply(`Couldn't unban this ID: ${err.message}`);
      return;
    }

    await sendModLog(interaction.client, {
      action: "✅ Unban",
      target: `<@${userId}> (${userId})`,
      moderator: `${interaction.user.tag}`,
      reason: "—",
    });

    await interaction.editReply(`User ID \`${userId}\` has been unbanned.`);
  },
};

const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { getUser } = require("../moderation/store.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Check a member's warning points and history.")
    .setDefaultMemberPermissions(null)
    .addUserOption((o) => o.setName("user").setDescription("Member to check").setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const record = getUser(interaction.guild.id, targetUser.id);

    if (record.history.length === 0) {
      await interaction.reply({
        content: `${targetUser.tag} has no warnings on record.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const lines = record.history
      .map(
        (h, i) =>
          `**${i + 1}.** ${h.offense} (+${h.points}) — ${h.reason} — <t:${Math.floor(h.timestamp / 1000)}:R>`
      )
      .join("\n");

    await interaction.reply({
      content: `**${targetUser.tag}** — Total points: **${record.points}**\n\n${lines}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

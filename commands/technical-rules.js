const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { rules, closingText } = require("../departments/technical.js");
const { buildRulesContainer } = require("../layout.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("technical-rules")
    .setDescription("Post the Technical Division rules layout with the interactive rule menu."),

  async execute(interaction) {
    const container = buildRulesContainer({
      title: "TECHNICAL DIVISION — RULES",
      rules,
      closingText,
      deptKey: "technical",
    });

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { rules, closingText } = require("../departments/research.js");
const { buildRulesContainer } = require("../layout.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("research-rules")
    .setDescription("Post the Research Division rules layout with the interactive rule menu."),

  async execute(interaction) {
    const container = buildRulesContainer({
      title: "RESEARCH DIVISION — RULES",
      rules,
      closingText,
      deptKey: "research",
    });

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

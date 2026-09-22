const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { rules, closingText } = require("../departments/medical.js");
const { buildRulesContainer } = require("../layout.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("medical-rules")
    .setDescription("Post the Medical Division rules layout with the interactive rule menu."),

  async execute(interaction) {
    const container = buildRulesContainer({
      title: "MEDICAL DIVISION — RULES",
      rules,
      closingText,
      deptKey: "medical",
    });

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

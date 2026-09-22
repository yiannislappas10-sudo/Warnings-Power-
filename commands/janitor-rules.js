const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { rules, closingText } = require("../departments/janitor.js");
const { buildRulesContainer } = require("../layout.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("janitor-rules")
    .setDescription("Post the Janitorial Division rules layout with the interactive rule menu."),

  async execute(interaction) {
    const container = buildRulesContainer({
      title: "JANITORIAL DIVISION — RULES",
      rules,
      closingText,
      deptKey: "janitor",
    });

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

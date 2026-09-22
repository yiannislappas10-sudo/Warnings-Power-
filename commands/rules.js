const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { rules, credits } = require("../rules.js");
const { buildRulesContainer } = require("../layout.js");

const closingText =
  `*Security is a position of trust. If you cannot control your weapon, your authority, or your behavior, you will not remain Security.*\n\n` +
  `**FAILURE TO FOLLOW THESE RULES WILL RESULT IN DISCIPLINARY ACTION**, including warning, suspension, demotion, or removal from Security depending on the severity of the violation.\n\n` +
  `-# ${credits}`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("security-rules")
    .setDescription("Post the SITE AEGIS 17 security rules layout with the interactive rule menu."),

  async execute(interaction) {
    const container = buildRulesContainer({
      title: "SITE AEGIS 17 — SECURITY RULES",
      rules,
      closingText,
      deptKey: "security",
    });

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

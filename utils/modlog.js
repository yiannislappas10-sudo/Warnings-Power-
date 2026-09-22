const { EmbedBuilder } = require("discord.js");
const { MOD_LOG_CHANNEL_ID } = require("../moderation/config.js");

async function sendModLog(client, { action, target, moderator, reason, extra }) {
  if (!MOD_LOG_CHANNEL_ID) return;
  try {
    const channel = await client.channels.fetch(MOD_LOG_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(action)
      .addFields(
        { name: "Target", value: `${target}`, inline: true },
        { name: "Moderator", value: `${moderator}`, inline: true },
        { name: "Reason", value: reason || "No reason provided" }
      )
      .setTimestamp();

    if (extra) embed.addFields(extra);

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Failed to send mod log:", err);
  }
}

module.exports = { sendModLog };

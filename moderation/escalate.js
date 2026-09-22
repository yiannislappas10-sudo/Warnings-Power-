const { THRESHOLDS } = require("./config.js");

function getActionForPoints(totalPoints) {
  for (const tier of THRESHOLDS) {
    if (totalPoints >= tier.points) return tier;
  }
  return null;
}

module.exports = { getActionForPoints };

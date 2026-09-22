// ============================================================
// EDIT EVERYTHING IN THIS FILE TO MATCH YOUR SERVER'S RULES.
// This is the only file you should need to touch day-to-day.
// ============================================================

// Each entry becomes one option in the "Select The Rule" dropdown, AND
// builds the nicely-styled private message someone gets when they pick it.
// - label: short text shown in the dropdown
// - value: unique id (no spaces, used internally)
// - description: optional one-liner shown under the label in the dropdown
// - title: the heading shown at the top of the private reply
// - bullets: array of lines, one per bullet point
module.exports.rules = [
  {
    label: "1. Weapon Discipline",
    value: "rule_1",
    description: "No firing without valid threat, no mag-dumping",
    title: "1. WEAPON DISCIPLINE",
    bullets: [
      "Do not fire without a valid threat.",
      "No unnecessary firing or mag-dumping.",
      "Do not shoot personnel because of suspicion alone.",
      "Do not fire into crowds or populated areas recklessly.",
      "Keep your weapon under control at all times.",
    ],
  },
  {
    label: "2. Identification",
    value: "rule_2",
    description: "Verify who you're dealing with before acting",
    title: "2. IDENTIFICATION",
    bullets: [
      "Know who you are dealing with before taking action.",
      "Do not attack someone simply because they are unfamiliar.",
      "Ask questions and verify their authorization when appropriate.",
      "If you are unsure, get a superior rather than immediately escalating.",
    ],
  },
  {
    label: "3. Post Discipline",
    value: "rule_3",
    description: "Stay at your position, remain attentive",
    title: "3. POST DISCIPLINE",
    bullets: [
      "Stay at your assigned position unless given permission to leave.",
      "Do not abandon your post during minor incidents.",
      "Do not wander around the facility looking for trouble.",
      "Remain attentive while stationed.",
    ],
  },
  {
    label: "4. Authority",
    value: "rule_4",
    description: "Follow superiors, never abuse your rank",
    title: "4. AUTHORITY",
    bullets: [
      "Follow orders from authorized superiors.",
      "Do not give orders beyond your rank.",
      "Do not threaten or intimidate personnel because you have a weapon.",
      "Security authority must never be used for personal arguments.",
    ],
  },
  {
    label: "5. Restricted Areas",
    value: "rule_5",
    description: "No unauthorized access to restricted zones",
    title: "5. RESTRICTED AREAS",
    bullets: [
      "Do not allow unauthorized personnel into restricted areas.",
      "Do not enter restricted zones without proper authorization.",
      "Do not give other players access to areas they are not cleared for.",
    ],
  },
  {
    label: "6. Incidents",
    value: "rule_6",
    description: "Stay calm, protect personnel, report up",
    title: "6. INCIDENTS",
    bullets: [
      "Stay calm during emergencies.",
      "Protect nearby personnel and secure the area.",
      "Do not make an incident worse through reckless behavior.",
      "Report serious incidents to the appropriate superior.",
    ],
  },
  {
    label: "7. Professional Conduct",
    value: "rule_7",
    description: "No harassment, no starting conflicts on duty",
    title: "7. PROFESSIONAL CONDUCT",
    bullets: [
      "No harassment, bullying, or unnecessary aggression.",
      "Do not randomly detain or attack people.",
      "Do not start conflicts while on duty.",
      "Remain professional even when other personnel are being difficult.",
    ],
  },
  {
    label: "8. Roleplay Discipline",
    value: "rule_8",
    description: "No OOC info IC, no random kills",
    title: "8. ROLEPLAY DISCIPLINE",
    bullets: [
      "Do not use OOC information for IC decisions.",
      "Do not randomly kill players for entertainment.",
      "Follow the facility's RP rules.",
      "Keep your actions appropriate to your character's position.",
    ],
  },
  {
    label: "9. Equipment",
    value: "rule_9",
    description: "Don't misuse or take others' equipment",
    title: "9. EQUIPMENT",
    bullets: [
      "Do not misuse security equipment.",
      "Do not take another officer's equipment without permission.",
      "Report missing or damaged equipment to a superior.",
    ],
  },
  {
    label: "10. Accountability",
    value: "rule_10",
    description: "Report mistakes, repeated violations = discipline",
    title: "10. ACCOUNTABILITY",
    bullets: [
      "Mistakes must be reported instead of hidden.",
      "Repeated violations will result in disciplinary action.",
      "Severe misconduct may result in immediate suspension or removal from Security.",
    ],
  },
];

// Shown when someone clicks the "Point Info" button.
module.exports.pointInfoText =
  "**Points & Punishment System**\n\n" +
  "• If someone breaks the rules, open a ticket in Support.\n" +
  "• You may re-join only with **High Rank** approval — you can apply by apologizing.\n" +
  "• Your warnings with points will be removed after **1 month**.\n" +
  "• If you get banned again, it will be **permanent with no excuse**.";

// Link buttons — replace with your actual URLs.
module.exports.links = {
  communityGuidelines: "https://discord.com/guidelines",
  support: "https://discord.gg/kCz3W4VT4",
};

// Icons used on the buttons. Swap these for custom emoji once you have them —
// custom emoji use the format "<:name:1234567890123456789>" (get the ID by
// typing \:emojiname: in Discord and copying what it shows you).
module.exports.icons = {
  communityGuidelines: "✅",
  support: "❓",
  pointInfo: "📌",
};

// Footer / credits shown on the rules embed.
module.exports.credits = "Made by Ryx and Heathcliff";

// The two warning-system bullet lines shown on every department's rules
// layout (server-wide policy, not specific to one department).
module.exports.pointInfoBullets = [
  `> • You may re-join only by *High Rank* approval\nYou can apply with apologize`,
  `> • Your warnings with points will be removed after a month.\nIf you get banned again, will be perm with no excuse.`,
];

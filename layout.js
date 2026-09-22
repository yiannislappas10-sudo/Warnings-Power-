// ============================================================
// Shared layout builders. You shouldn't need to edit this file —
// edit the department files in /departments instead.
// ============================================================
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { links, icons, pointInfoBullets } = require("./rules.js");

// Shared top part every layout starts with: title + ToS line/button.
function addHeader(container, title) {
  return container
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${title}`))
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `And most important thing, you must follow [Discord's Terms of Service](${links.communityGuidelines})`
          )
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel("Community Guidelines")
            .setStyle(ButtonStyle.Link)
            .setURL(links.communityGuidelines)
            .setEmoji(icons.communityGuidelines)
        )
    )
    .addSeparatorComponents(new SeparatorBuilder());
}

// Shared bottom part every layout ends with: Support button, Point Info
// button, the warning bullets, and the department's own closing text.
function addFooter(container, closingText) {
  container
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("> • If you have a problem or a question, open a ticket in support.")
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel("Support")
            .setStyle(ButtonStyle.Link)
            .setURL(links.support)
            .setEmoji(icons.support)
        )
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("**Click the button to see points and punishment.**")
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId("point_info")
            .setLabel("Point Info")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(icons.pointInfo)
        )
    );

  for (const line of pointInfoBullets) {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(line));
  }

  container.addSeparatorComponents(new SeparatorBuilder());
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(closingText));

  return container;
}

// Standard single-dropdown layout (Security, Research, Medical, Technical, Janitor).
// deptKey is baked into the dropdown's customId as "rules_select:<deptKey>" so
// index.js knows which flat rule list to look in when someone picks one.
function buildRulesContainer({ title, rules, closingText, deptKey }) {
  const container = new ContainerBuilder().setAccentColor(0x000000);
  addHeader(container, title);

  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Click **"Select The Rule"** to read the rules. They're important too.\n` +
          `If it gives error **"This interaction failed"** try again.`
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`rules_select:${deptKey}`)
          .setPlaceholder("Select The Rule")
          .addOptions(
            rules.map((r) => ({
              label: r.label,
              value: r.value,
              description: r.description,
            }))
          )
      )
    );

  addFooter(container, closingText);
  return container;
}

// Two-level layout: first dropdown picks a CATEGORY (e.g. Discord Rules /
// In-Game Rules / Bot's Rules); picking one opens a second private dropdown
// listing that category's actual rules. Used by e.g. Envy Economy.
// customId is "rules_category:<deptKey>" - picking a category triggers
// index.js to build the second dropdown from that category's `rules` array.
function buildCategoryPickerContainer({ title, categories, closingText, deptKey }) {
  const container = new ContainerBuilder().setAccentColor(0x000000);
  addHeader(container, title);

  container
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Click **"Select A Category"** to pick Discord Rules, In-Game Rules, or the Bot's Rules.\n` +
          `If it gives error **"This interaction failed"** try again.`
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`rules_category:${deptKey}`)
          .setPlaceholder("Select A Category")
          .addOptions(
            Object.entries(categories).map(([key, cat]) => ({
              label: cat.label,
              value: key,
              description: cat.description,
            }))
          )
      )
    );

  addFooter(container, closingText);
  return container;
}

// The second-level, private dropdown shown after someone picks a category.
function buildCategoryRuleSelect({ categoryLabel, rules, customId }) {
  const container = new ContainerBuilder()
    .setAccentColor(0x000000)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${categoryLabel}`))
    .addSeparatorComponents(new SeparatorBuilder());

  if (!rules || rules.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No rules have been added for this category yet.*")
    );
    return container;
  }

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder("Select The Rule")
        .addOptions(
          rules.map((r) => ({
            label: r.label,
            value: r.value,
            description: r.description,
          }))
        )
    )
  );

  return container;
}

// The final private reply showing one rule's full title + bullets.
function buildRuleDetailContainer(chosen) {
  const bulletText = chosen.bullets.map((b) => `> • ${b}`).join("\n");
  return new ContainerBuilder()
    .setAccentColor(0x000000)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${chosen.title}`))
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(bulletText));
}

module.exports = {
  buildRulesContainer,
  buildCategoryPickerContainer,
  buildCategoryRuleSelect,
  buildRuleDetailContainer,
};

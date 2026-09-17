const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require('discord.js');

async function getRoleNames(guild, roleIds) {
  const roleNames = [];
  for (const roleId of roleIds) {
    try {
      const role = await guild.roles.cache.get(roleId);
      if (role) {
        roleNames.push(role.name);
      } else {
        console.warn(`Rolle mit ID ${roleId} nicht gefunden.`);
        roleNames.push('Unbekannte Rolle');
      }
    } catch (error) {
      console.error(`Fehler beim Abrufen der Rolle mit ID ${roleId}:`, error);
      roleNames.push('Fehler beim Abrufen');
    }
  }
  return roleNames;
}

async function printSelectMenu(selMenu, guild) {
  try {
    const rolenames = await getRoleNames(guild, selMenu.roleIds);
    const smCustomId = `${selMenu.selectMenu}_selmen_menu`;
    const placeholder = 'Bitte auswählen';
    const content = selMenu.selectDescription;
    const bCustomId = `${selMenu.selectMenu}_selmen_remove`;
    const bLabel = 'Rolle(n) entfernen';
    let min = 1;
    let max = 1;
    if (selMenu.isMulti) {
      min = 0;
      max = rolenames.length;
    }
    let roles = [];
    let selectMenu = null;
    for (let i = 0; i < rolenames.length; i++) {
      roles[i] = {
        label: rolenames[i],
        value: rolenames[i],
      };
    }
    selectMenu = new StringSelectMenuBuilder()
      .setCustomId(smCustomId)
      .setPlaceholder(placeholder)
      .setMinValues(min)
      .setMaxValues(max)
      .addOptions(
        roles.map((role) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(role.label)
            .setValue(role.value),
        ),
      );
    const button = new ButtonBuilder()
      .setCustomId(bCustomId)
      .setLabel(bLabel)
      .setStyle('Danger');
    const row = new ActionRowBuilder().addComponents(selectMenu);
    const row2 = new ActionRowBuilder().addComponents(button);
    return {
      content: content,
      components: [row, row2],
    };
  } catch (error) {
    console.log(error);
  }
}
module.exports = printSelectMenu;

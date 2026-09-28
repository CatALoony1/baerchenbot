const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require('discord.js');

async function getRoleArray(guild, roleIds) {
  const roleArray = [];
  for (const roleId of roleIds) {
    try {
      const role = await guild.roles.cache.get(roleId);
      if (role) {
        roleArray.push({ label: role.name, value: roleId });
      } else {
        console.log(`ERROR: Rolle mit ID ${roleId} nicht gefunden.`);
      }
    } catch (error) {
      console.log(
        `ERROR: Fehler beim Abrufen der Rolle mit ID ${roleId}:`,
        error,
      );
      roleArray.push('Fehler beim Abrufen');
    }
  }
  return roleArray;
}

async function printSelectMenu(selMenu, guild) {
  try {
    const roles = await getRoleArray(guild, selMenu.roleIds);
    const smCustomId = `${selMenu.selectMenu}_selmen_menu`;
    const placeholder = 'Bitte auswählen';
    const content = selMenu.selectDescription;
    const bCustomId = `${selMenu.selectMenu}_selmen_remove`;
    const bLabel = 'Rolle(n) entfernen';
    let min = 1;
    let max = 1;
    if (selMenu.multiSelect) {
      min = 0;
      max = roles.length;
    }
    let selectMenu = new StringSelectMenuBuilder()
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

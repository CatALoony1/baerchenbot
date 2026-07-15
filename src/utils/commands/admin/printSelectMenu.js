const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require('discord.js');

const {
  ageRoles,
  colorRoles,
  dmRoles,
  dmEmojis,
  gameRoles,
  pingRoles,
  pingEmojis,
  platformRoles,
  pronounRoles,
  regionRoles,
  countryRoles,
  countryEmojis,
  hogwartsRoles,
  hogwartsEmojis,
} = require('../../selectMenuRoles');

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

async function doPrintSelectMenuCommand(interaction) {
  try {
    const selectmenu = interaction.options.get('selectmenu').value;
    let rolenames = [];
    let smCustomId = '';
    let placeholder = '';
    let min = 1;
    let max = 1;
    let content = '';
    let bCustomId = '';
    let bLabel = '';
    let emoji = null;
    switch (selectmenu) {
      case 'age':
        rolenames = ageRoles;
        smCustomId = 'ageselect';
        placeholder = 'Wähle dein Alter';
        content = 'Bitte wähle dein Alter aus:';
        bCustomId = 'removeAge';
        bLabel = 'Altersrolle entfernen';
        break;
      case 'color':
        rolenames = await getRoleNames(interaction.guild, colorRoles);
        smCustomId = 'colorselect';
        placeholder = 'Wähle deine Lieblingsfarbe';
        content = 'Bitte wähle deine Lieblingsfarbe aus:';
        bCustomId = 'removeColor';
        bLabel = 'Farbenrolle entfernen';
        break;
      case 'dm':
        rolenames = dmRoles;
        smCustomId = 'dmselect';
        placeholder = 'DM-Einstellungen';
        content = 'Bitte wähle deine DM-Einstellungen aus:';
        bCustomId = 'removeDm';
        bLabel = 'DM-Rolle entfernen';
        emoji = dmEmojis;
        break;
      case 'game':
        rolenames = gameRoles;
        smCustomId = 'gameselect';
        placeholder = 'Wähle deine Lieblingsspiele';
        content = 'Bitte wähle deine Lieblingsspiele aus:';
        bCustomId = 'removeGame';
        bLabel = 'Spielerollen entfernen';
        min = 0;
        max = rolenames.length;
        break;
      case 'ping':
        rolenames = pingRoles;
        smCustomId = 'pingselect';
        placeholder = 'Ping-Einstellungen';
        content = 'Bitte wähle deine Ping-Einstellungen aus:';
        bCustomId = 'removePingRoles';
        bLabel = 'Pingrolle entfernen';
        emoji = pingEmojis;
        min = 0;
        max = rolenames.length;
        break;
      case 'platform':
        rolenames = platformRoles;
        smCustomId = 'platformselect';
        placeholder = 'Wähle deine Plattform';
        content = 'Bitte wähle deine Plattformen aus:';
        bCustomId = 'removePlatformRoles';
        bLabel = 'Plattformrollen entfernen';
        min = 0;
        max = rolenames.length;
        break;
      case 'pronoun':
        rolenames = pronounRoles;
        smCustomId = 'pronounselect';
        placeholder = 'Wähle dein Pronomen';
        content = 'Bitte wähle dein Pronomen aus:';
        bCustomId = 'removePronouns';
        bLabel = 'Pronomenrollen entfernen';
        min = 0;
        max = rolenames.length;
        break;
      case 'region':
        rolenames = regionRoles;
        smCustomId = 'regionselect';
        placeholder = 'Bundesland auswählen';
        content = 'Bitte wähle dein Bundesland aus:';
        bCustomId = 'removeRegion';
        bLabel = 'Bundesland entfernen';
        break;
      case 'country':
        rolenames = countryRoles;
        smCustomId = 'countryselect';
        placeholder = 'Land auswählen';
        content = 'Bitte wähle dein Land aus:';
        bCustomId = 'removeCountry';
        bLabel = 'Land entfernen';
        emoji = countryEmojis;
        break;
      case 'hogwarts':
        rolenames = hogwartsRoles;
        smCustomId = 'hogwartselect';
        placeholder = 'Hogwarts-Haus auswählen';
        content = 'Bitte wähle dein Hogwarts-Haus aus:';
        bCustomId = 'removeHogwarts';
        bLabel = 'Hogwarts-Haus entfernen';
        emoji = hogwartsEmojis;
        break;
      default:
        throw new Error('Ungültiges SelectMenu gewählt.');
    }
    let roles = [];
    let selectMenu = null;
    if (emoji != null) {
      for (let i = 0; i < rolenames.length; i++) {
        roles[i] = {
          label: rolenames[i],
          value: rolenames[i],
          emoji: emoji[i],
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
              .setValue(role.value)
              .setEmoji(role.emoji),
          ),
        );
    } else {
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
    }
    const button = new ButtonBuilder()
      .setCustomId(bCustomId)
      .setLabel(bLabel)
      .setStyle('Danger');
    const row = new ActionRowBuilder().addComponents(selectMenu);
    const row2 = new ActionRowBuilder().addComponents(button);
    await interaction.reply({
      content: content,
      components: [row, row2],
    });
  } catch (error) {
    console.log(error);
  }
}
module.exports = doPrintSelectMenuCommand;

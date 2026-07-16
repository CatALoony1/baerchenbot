const { MessageFlags } = require('discord.js');
const Config = require('../../models/Config');
const Items = require('../../models/Items');
const LevelRoles = require('../../models/LevelRoles');
const QuizQuestion = require('../../models/QuizQuestion');
const RoleSelectionRoles = require('../../models/RoleSelectionRoles');
const ServerConfig = require('../../models/ServerConfig');

async function databaseModal(interaction) {
  const [, type, name] = interaction.customId.split('-');
  let dbModel;
  switch (name) {
    case 'Config':
      dbModel = Config;
      break;
    case 'Items':
      dbModel = Items;
      break;
    case 'LevelRoles':
      dbModel = LevelRoles;
      break;
    case 'QuizQuestion':
      dbModel = QuizQuestion;
      break;
    case 'RoleSelectionRoles':
      dbModel = RoleSelectionRoles;
      break;
    case 'ServerConfig':
      dbModel = ServerConfig;
      break;
  }
  const spalten = Object.keys(dbModel.schema.paths)
    .filter((fieldName) => fieldName !== '_id' && fieldName !== '__v')
    .map((fieldName) => {
      const pathDetails = dbModel.schema.paths[fieldName];
      return {
        name: fieldName,
        type: pathDetails.instance,
        value: undefined,
      };
    });
  for (const spalte of spalten) {
    if (spalte.name === 'guildId') {
      spalte.value = process.env.GUILD_ID;
    } else if (spalte.type !== 'Boolean') {
      const value = interaction.fields.getTextInputValue(spalte.name);
      if (value) {
        spalte.value = value;
      }
    } else {
      const value = interaction.fields.getRadioGroup(spalte.name);
      if (value && value === 'true') {
        spalte.value = true;
      } else if (value) {
        spalte.value = false;
      }
    }
  }
  if (type === 'update') {
  } else if (type === 'delete') {
  } else if (type === 'insert') {
    const newDocument = new dbModel(
      spalten.reduce((acc, spalte) => {
        if (spalte.value !== undefined) {
          acc[spalte.name] = spalte.value;
        }
        return acc;
      }, {}),
    );
    await newDocument.save();
    await interaction.reply({
      content: 'DB-Eintrag erfolgreich erstellt!',
      flags: MessageFlags.Ephemeral,
    });
  }
}
module.exports = databaseModal;

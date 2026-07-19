const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  LabelBuilder,
  RadioGroupBuilder,
} = require('discord.js');

const Config = require('../../../models/Config');
const Items = require('../../../models/Items');
const LevelRoles = require('../../../models/LevelRoles');
const QuizQuestion = require('../../../models/QuizQuestion');
const RoleSelectionRoles = require('../../../models/RoleSelectionRoles');
const ServerConfig = require('../../../models/ServerConfig');

async function doDbCommand(interaction) {
  try {
    const subcommand = interaction.options.getSubcommand();
    const database = interaction.options.get('database').value;
    let dbModel;
    switch (database) {
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
      .filter(
        (fieldName) =>
          fieldName !== 'guildId' && fieldName !== '_id' && fieldName !== '__v',
      )
      .map((fieldName) => {
        const pathDetails = dbModel.schema.paths[fieldName];
        return {
          name: fieldName,
          type: pathDetails.instance,
          required: pathDetails.isRequired || false,
        };
      });
    const subcommandtype =
      subcommand === 'db-search'
        ? 'search'
        : subcommand === 'db-insert'
          ? 'insert'
          : null;
    let modalTitle;
    if (subcommandtype === 'search') {
      modalTitle = 'Wonach willst du suchen?';
    } else if (subcommandtype === 'insert') {
      modalTitle = 'Welche Daten willst du einfügen?';
    }
    const modal = new ModalBuilder()
      .setTitle(modalTitle)
      .setCustomId(`database-${subcommandtype}-${database}`);
    for (const { name, type, required } of spalten) {
      let inputLabel;
      let isRequired = false;
      if (subcommandtype === 'insert') {
        isRequired = required;
      }
      if (type === 'String') {
        const input = new TextInputBuilder()
          .setCustomId(`${name}`)
          .setStyle(TextInputStyle.Short)
          .setRequired(isRequired)
          .setMaxLength(100);
        inputLabel = new LabelBuilder()
          .setLabel(name)
          .setTextInputComponent(input);
      } else if (type === 'Number') {
        const input = new TextInputBuilder()
          .setCustomId(`${name}`)
          .setStyle(TextInputStyle.Short)
          .setRequired(isRequired)
          .setMaxLength(10);
        inputLabel = new LabelBuilder()
          .setLabel(name)
          .setTextInputComponent(input);
      } else if (type === 'Boolean') {
        const input = new RadioGroupBuilder()
          .setCustomId(`${name}`)
          .setRequired(isRequired)
          .setOptions([
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
          ]);
        inputLabel = new LabelBuilder()
          .setLabel(name)
          .setRadioGroupComponent(input);
      }
      modal.addLabelComponents(inputLabel);
    }
    await interaction.showModal(modal);
  } catch (error) {
    console.log(error);
  }
}
module.exports = doDbCommand;

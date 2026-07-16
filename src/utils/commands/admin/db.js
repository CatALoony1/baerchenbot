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
      subcommand === 'db-update'
        ? 'updatesearch'
        : subcommand === 'db-delete'
          ? 'deletesearch'
          : subcommand === 'db-insert'
            ? 'insert'
            : null;
    let modalTitle;
    if (subcommandtype === 'updatesearch') {
      modalTitle = 'Wonach willst du zum updaten suchen?';
    } else if (subcommandtype === 'deletesearch') {
      modalTitle = 'Wonach willst du zum löschen suchen?';
    } else if (subcommandtype === 'insert') {
      modalTitle = 'Welche Daten willst du einfügen?';
    }
    const modal = new ModalBuilder()
      .setTitle(modalTitle)
      .setCustomId(`database-${subcommandtype}-${database}`);
    for (const { name, type, required } of spalten) {
      let input;
      if (type === 'String') {
        input = new TextInputBuilder()
          .setCustomId(`${name}`)
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setMaxLength(100);
        const inputLabel = new LabelBuilder()
          .setLabel(name)
          .setTextInputComponent(input);
      } else if (type === 'Number' || type === 'Date') {
        input = new TextInputBuilder()
          .setCustomId(`${name}`)
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setMaxLength(10);
        const inputLabel = new LabelBuilder()
          .setLabel(name)
          .setTextInputComponent(input);
      } else if (type === 'Boolean') {
        input = new RadioGroupBuilder()
          .setCustomId(`${name}`)
          .setRequired(false)
          .addOptions(
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
          );
        const inputLabel = new LabelBuilder()
          .setLabel(name)
          .setRadioGroupComponent(input);
      } else if (type === 'Array') {
        input = new TextInputBuilder()
          .setCustomId(`${name}`)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setMaxLength(500);
        const inputLabel = new LabelBuilder()
          .setLabel(name)
          .setTextInputComponent(input);
      }
      modal.addLabelComponents(inputLabel);
      await interaction.showModal(modal);
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = doDbCommand;

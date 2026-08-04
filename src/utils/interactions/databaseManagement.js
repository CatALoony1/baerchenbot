const {
  MessageFlags,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ModalBuilder,
  LabelBuilder,
  CheckboxGroupBuilder,
  RadioGroupBuilder,
  TextInputBuilder,
} = require('discord.js');
const Config = require('../../models/Config');
const Items = require('../../models/Items');
const LevelRoles = require('../../models/LevelRoles');
const QuizQuestion = require('../../models/QuizQuestion');
const RoleSelectionRoles = require('../../models/RoleSelectionRoles');
const ServerConfig = require('../../models/ServerConfig');
const NodeCache = require('node-cache');

const searchCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

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
  if (type !== 'delete') {
    const spalten = Object.keys(dbModel.schema.paths)
      .filter((fieldName) => fieldName !== '_id' && fieldName !== '__v')
      .map((fieldName) => {
        const pathDetails = dbModel.schema.paths[fieldName];
        return {
          name: fieldName,
          type: pathDetails.instance,
          required: pathDetails.isRequired || false,
          value: undefined,
        };
      });
    if (type !== 'update') {
      let noValues = true;
      for (const spalte of spalten) {
        if (spalte.name === 'guildId') {
          spalte.value = process.env.GUILD_ID;
        } else if (spalte.type !== 'Boolean') {
          const value = interaction.fields.getTextInputValue(spalte.name);
          if (value) {
            spalte.value = value;
            noValues = false;
          }
        } else {
          const value = interaction.fields.getRadioGroup(spalte.name);
          if (value && value === 'true') {
            spalte.value = true;
            noValues = false;
          } else if (value) {
            spalte.value = false;
            noValues = false;
          }
        }
      }
      if (noValues) {
        await interaction.reply({
          content: 'Keine Eingabeparameter übergeben.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const invalidFields = await validateInput(spalten);
      if (invalidFields.length > 0) {
        await interaction.reply({
          content:
            'Die folgenden Eingabewerte entsprechen nicht dem erwarteten Typ:\n' +
            invalidFields.join('\n'),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (type.includes('search')) {
        const query = spalten.reduce((acc, spalte) => {
          if (spalte.value !== undefined) {
            acc[spalte.name] = spalte.value;
          }
          return acc;
        }, {});
        const results = await dbModel.find(query);
        if (!results || results.length < 1) {
          await interaction.reply({
            content:
              'Es konnten keine Zeilen zu den übergebenen Eingaben gefunden werden.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const resultIds = results.map((doc) => doc._id.toString);
        searchCache.set(interaction.user.id, resultIds);
        const descriptionLines = results.map((doc, index) => {
          const rowDetails = spalten.map((spalte) => {
            let value = doc[spalte.name];
            if (value === undefined || value === null || value === '') {
              return `**${spalte.name}:** -`;
            }
            if (typeof value === 'object') {
              value = JSON.stringify(value);
            } else {
              value = String(value);
            }
            if (value.length > 40) {
              value = value.substring(0, 37) + '...';
            }
            return `**${spalte.name}:** ${value}`;
          });
          return `**${index + 1}. Eintrag:**\n> ${rowDetails.join('\n> ')}`;
        });
        let description = descriptionLines.join('\n\n');
        if (description.length > 4096) {
          description = description.substring(0, 4090) + '...';
        }
        const embed = new EmbedBuilder()
          .setTitle('Suchergebnisse')
          .setDescription(description)
          .setColor('Blue');

        const deleteButton = new ButtonBuilder()
          .setCustomId(`db_delete_button_${name}`)
          .setLabel('Einträge löschen')
          .setStyle(ButtonStyle.Danger);
        const updateButton = new ButtonBuilder()
          .setCustomId(`db_update_button_${name}`)
          .setLabel('Eintrag bearbeiten')
          .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(
          deleteButton,
          updateButton,
        );
        await interaction.reply({
          embeds: [embed],
          components: [row],
          flags: MessageFlags.Ephemeral,
        });
      } else if (type === 'insert') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!(await allRequired(spalten))) {
          await interaction.editReply({
            content: 'Bitte fülle alle erforderlichen Felder aus.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const newDocument = new dbModel(
          spalten.reduce((acc, spalte) => {
            if (spalte.value !== undefined) {
              acc[spalte.name] = spalte.value;
            }
            return acc;
          }, {}),
        );
        await newDocument.save();
        await interaction.editReply({
          content: 'DB-Eintrag erfolgreich erstellt!',
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const toBeUpdated = interaction.fields.getRadioGroup(name);
      if (!toBeUpdated) {
        await interaction.editReply({
          content: 'Keine Werte übergeben.',
        });
        return;
      }
      const lineToBeUpdated = await dbModel.findOne({ _id: toBeUpdated });
      if (!lineToBeUpdated) {
        await interaction.editReply({
          content: 'Der DB Eintrag existiert nicht mehr.',
        });
        return;
      }
      for (const spalte of spalten) {
        if (spalte.name === 'guildId') {
          spalte.value = process.env.GUILD_ID;
        } else if (spalte.type !== 'Boolean') {
          const value = lineToBeUpdated[spalte.name];
          if (value) {
            spalte.value = value;
          } else {
            spalte.value = '';
          }
        } else {
          const value = lineToBeUpdated[palte.name];
          if (value && value === 'true') {
            spalte.value = true;
          } else if (value) {
            spalte.value = false;
          }
        }
      }
      const modal = new ModalBuilder()
        .setTitle('Eintrag editieren')
        .setCustomId(`database-updatecommit-${database}-${toBeUpdated}`);
      for (const { name, type, required, value } of spalten) {
        if (name !== 'guildId') {
          let inputLabel;
          let isRequired = required;
          if (type === 'String' || type === 'Number') {
            const input = new TextInputBuilder()
              .setCustomId(`${name}`)
              .setStyle(TextInputStyle.Short)
              .setRequired(isRequired)
              .setMaxLength(100)
              .setPlaceholder(value);
            inputLabel = new LabelBuilder()
              .setLabel(name)
              .setTextInputComponent(input);
          } else if (type === 'Boolean') {
            const input = new RadioGroupBuilder()
              .setCustomId(`${name}`)
              .setRequired(isRequired)
              .setOptions([
                { label: 'True', value: 'true', default: value },
                { label: 'False', value: 'false', default: !value },
              ]);
            inputLabel = new LabelBuilder()
              .setLabel(name)
              .setRadioGroupComponent(input);
          }
          modal.addLabelComponents(inputLabel);
        }
      }
      await interaction.showModal(modal);
    }
  } else {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const toBeDeleted = interaction.fields.getCheckboxGroup(name);
    if (!toBeDeleted || toBeDeleted.length < 1) {
      await interaction.editReply({
        content: 'Keine Werte übergeben.',
      });
      return;
    }
    try {
      dbModel.deleteMany({
        _id: { $in: toBeDeleted },
      });
      searchCache.del(interaction.user.id);
      await interaction.editReply({
        content: 'Erfolgreich gelöscht.',
      });
    } catch (error) {
      console.log(error);
    }
  }
}
async function databaseButtons(interaction) {
  const [, type, , name] = interaction.customId.split('_');
  const cachedIds = searchCache.get(interaction.user.id);
  if (!cachedIds || cachedIds.length < 1) {
    await interaction.reply({
      content: 'Suche ist zu alt, bitte suche neu!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  let modalTitle;
  let inputLabel;
  const options = cachedIds.map((id, index) => ({
    label: (index + 1).toString(),
    value: id.toString(),
  }));
  if (type === 'delete') {
    const input = new CheckboxGroupBuilder()
      .setCustomId(`${name}`)
      .setRequired(true)
      .addOptions(...options)
      .setMinValues(1);
    inputLabel = new LabelBuilder()
      .setLabel('Eintrag wählen:')
      .setRadioGroupComponent(input);
    modalTitle = 'Welche Einträge soll gelöscht werden?';
  } else {
    const input = new RadioGroupBuilder()
      .setCustomId(`${name}`)
      .setRequired(true)
      .addOptions(...options);
    inputLabel = new LabelBuilder()
      .setLabel('Eintrag wählen:')
      .setRadioGroupComponent(input);
    modalTitle = 'Welcher Eintrag soll bearbeitet werden?';
  }
  const modal = new ModalBuilder.setTitle(modalTitle).setCustomId(
    `database-${type}-${name}`,
  );
  modal.addLabelComponents(inputLabel);
  await interaction.showModal(modal);
}
async function allRequired(spaltenMitWerten) {
  let isValid = true;
  for (const spalte of spaltenMitWerten) {
    const { type, value, required } = spalte;
    if (required && !value) {
      isValid = false;
      break;
    }
  }
  return isValid;
}
async function validateInput(spaltenMitWerten) {
  let invalidFields = [];
  for (const spalte of spaltenMitWerten) {
    const { type, value } = spalte;
    if (type === 'Number' && value !== undefined && isNaN(Number(value))) {
      invalidFields.push(
        `${spalte.name}: Erwartet eine Zahl, aber erhalten: ${value}`,
      );
    }
  }
  return invalidFields;
}
module.exports = { databaseModal, databaseButtons };

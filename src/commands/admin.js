const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
const doJobCommands = require('../utils/commands/admin/job');
const doloescheCommand = require('../utils/commands/admin/loesche');
const doInformedInactiveCommand = require('../utils/commands/admin/informedInactive');
const doPrintSelectMenuCommand = require('../utils/commands/admin/printSelectMenu');
const doDbCommand = require('../utils/commands/admin/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Verschiedene Admin-Befehle.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('job-start')
        .setDescription('Starte den Job.')
        .addStringOption((option) =>
          option
            .setName('job')
            .setDescription('Job der gestartet werden soll.')
            .setRequired(true)
            .addChoices(
              { name: 'bumpReminder', value: 'bumpReminder' },
              { name: 'checkBumperRole', value: 'checkBumperRole' },
              { name: 'checkInactive', value: 'checkInactive' },
              { name: 'customStatus', value: 'customStatus' },
              { name: 'geburtstag', value: 'geburtstag' },
              { name: 'monthlyXP', value: 'monthlyXP' },
              { name: 'newYear', value: 'newYear' },
              { name: 'quizQuestion', value: 'quizQuestion' },
              { name: 'quizStats', value: 'quizStats' },
              { name: 'renameLogFile', value: 'renameLogFile' },
              { name: 'voiceXP', value: 'voiceXP' },
              { name: 'missingXp', value: 'missingXp' },
              { name: 'zinsen', value: 'zinsen' },
              { name: 'checkActiveItems', value: 'checkActiveItems' },
              { name: 'checkVoiceChannels', value: 'checkVoiceChannels' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('job-stop')
        .setDescription('Stoppe den Job.')
        .addStringOption((option) =>
          option
            .setName('job')
            .setDescription('Job der gestoppt werden soll.')
            .setRequired(true)
            .addChoices(
              { name: 'bumpReminder', value: 'bumpReminder' },
              { name: 'checkBumperRole', value: 'checkBumperRole' },
              { name: 'checkInactive', value: 'checkInactive' },
              { name: 'customStatus', value: 'customStatus' },
              { name: 'geburtstag', value: 'geburtstag' },
              { name: 'monthlyXP', value: 'monthlyXP' },
              { name: 'newYear', value: 'newYear' },
              { name: 'quizQuestion', value: 'quizQuestion' },
              { name: 'quizStats', value: 'quizStats' },
              { name: 'renameLogFile', value: 'renameLogFile' },
              { name: 'voiceXP', value: 'voiceXP' },
              { name: 'missingXp', value: 'missingXp' },
              { name: 'zinsen', value: 'zinsen' },
              { name: 'checkActiveItems', value: 'checkActiveItems' },
              { name: 'checkVoiceChannels', value: 'checkVoiceChannels' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('job-execute')
        .setDescription('Führe den Job aus.')
        .addStringOption((option) =>
          option
            .setName('job')
            .setDescription('Job der ausgeführt werden soll.')
            .setRequired(true)
            .addChoices(
              { name: 'quizQuestion', value: 'quizQuestion' },
              { name: 'quizStats', value: 'quizStats' },
              { name: 'geburtstag', value: 'geburtstag' },
              { name: 'checkNewAnimals', value: 'checkNewAnimals' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('job-stop-all').setDescription('Stoppe alle Jobs.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('loesche')
        .setDescription('Loescht Nachrichten (max. 14 Tage alt).')
        .addIntegerOption((option) =>
          option
            .setName('anzahl')
            .setDescription('Anzahl der zu loeschenden Nachrichten.')
            .setRequired(true)
            .setMaxValue(100)
            .setMinValue(1),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('informed-inactive-add')
        .setDescription('Setzt Nutzer inaktiv.')
        .addUserOption((option) =>
          option.setName('nutzer').setDescription('Nutzer').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('informed-inactive-remove')
        .setDescription('Entfernt Nutzer inaktiv.')
        .addUserOption((option) =>
          option.setName('user').setDescription('Nutzer').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('printselectmenu')
        .setDescription('Erzeugt ein Rollenselect.')
        .addStringOption((option) =>
          option
            .setName('selectmenu')
            .setDescription('Das SelectMenu welches gesendet werden soll')
            .setRequired(true)
            .addChoices(
              { name: 'age', value: 'age' },
              { name: 'color', value: 'color' },
              { name: 'dm', value: 'dm' },
              { name: 'game', value: 'game' },
              { name: 'ping', value: 'ping' },
              { name: 'platform', value: 'platform' },
              { name: 'pronoun', value: 'pronoun' },
              { name: 'region', value: 'region' },
              { name: 'country', value: 'country' },
              { name: 'hogwarts', value: 'hogwarts' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('db-insert')
        .setDescription('Fügt Daten in die Datenbank ein.')
        .addStringOption((option) =>
          option
            .setName('database')
            .setDescription(
              'Die Datenbank in die Daten eingetragen werden sollen.',
            )
            .setRequired(true)
            .addChoices(
              { name: 'Config', value: 'Config' },
              { name: 'Items', value: 'Items' },
              { name: 'LevelRoles', value: 'LevelRoles' },
              { name: 'QuizQuestion', value: 'QuizQuestion' },
              { name: 'RoleSelectionRoles', value: 'RoleSelectionRoles' },
              { name: 'ServerConfig', value: 'ServerConfig' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('db-delete')
        .setDescription('Löscht Daten aus der Datenbank.')
        .addStringOption((option) =>
          option
            .setName('database')
            .setDescription(
              'Die Datenbank aus der Daten gelöscht werden sollen.',
            )
            .setRequired(true)
            .addChoices(
              { name: 'Config', value: 'Config' },
              { name: 'Items', value: 'Items' },
              { name: 'LevelRoles', value: 'LevelRoles' },
              { name: 'QuizQuestion', value: 'QuizQuestion' },
              { name: 'RoleSelectionRoles', value: 'RoleSelectionRoles' },
              { name: 'ServerConfig', value: 'ServerConfig' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('db-update')
        .setDescription('Aktualisiert Daten in der Datenbank.')
        .addStringOption((option) =>
          option
            .setName('database')
            .setDescription(
              'Die Datenbank in der Daten aktualisiert werden sollen.',
            )
            .setRequired(true)
            .addChoices(
              { name: 'Config', value: 'Config' },
              { name: 'Items', value: 'Items' },
              { name: 'LevelRoles', value: 'LevelRoles' },
              { name: 'QuizQuestion', value: 'QuizQuestion' },
              { name: 'RoleSelectionRoles', value: 'RoleSelectionRoles' },
              { name: 'ServerConfig', value: 'ServerConfig' },
            ),
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction, client }) => {
    console.log(
      `SlashCommand ${interaction.commandName} ${interaction.options.getSubcommand()} was executed by user ${interaction.member.user.tag}`,
    );
    try {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand.includes('job')) {
        await doJobCommands(interaction, client);
      } else if (subcommand === 'loesche') {
        await doloescheCommand(interaction);
      } else if (subcommand.includes('informed-inactive')) {
        await doInformedInactiveCommand(interaction);
      } else if (subcommand === 'printselectmenu') {
        await doPrintSelectMenuCommand(interaction);
      } else if (subcommand.includes('db')) {
        await doDbCommand(interaction);
      }
    } catch (error) {
      console.log(error);
    }
  },
};

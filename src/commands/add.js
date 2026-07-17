const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

const doQuizCommand = require('../utils/commands/add/quiz');
const doGeburtstagCommand = require('../utils/commands/add/geburtstag');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Verschiedene Befehle zum Hinzufügen von Daten.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('geburtstag')
        .setDescription('Trage deinen Geburtstag ein.')
        .addIntegerOption((option) =>
          option
            .setName('tag')
            .setDescription('Tag des Geburtstags.')
            .setRequired(true)
            .setMaxValue(31)
            .setMinValue(1),
        )
        .addIntegerOption((option) =>
          option
            .setName('monat')
            .setDescription('Monat des Geburtstags.')
            .setRequired(true)
            .setMaxValue(12)
            .setMinValue(1),
        )
        .addIntegerOption((option) =>
          option
            .setName('jahr')
            .setDescription('Jahr des Geburtstags.')
            .setRequired(true)
            .setMaxValue(new Date().getFullYear())
            .setMinValue(1900),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('quiz').setDescription('Füge eine Frage hinzu'),
    )
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction }) => {
    console.log(
      `SlashCommand ${interaction.commandName} ${interaction.options.getSubcommand()} was executed by user ${interaction.member.user.tag}`,
    );
    try {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === 'geburtstag') {
        await doGeburtstagCommand(interaction);
      } else if (subcommand === 'quiz') {
        await doQuizCommand(interaction);
      }
    } catch (error) {
      console.log(error);
    }
  },
};

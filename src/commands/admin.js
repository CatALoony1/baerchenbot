const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
} = require('discord.js');
const doloescheCommand = require('../utils/commands/admin/loesche');
const doPrintSelectMenuCommand = require('../utils/commands/admin/printSelectMenu');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Verschiedene Admin-Befehle.')
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
    .subcommand((subcommand) =>
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
      if (subcommand === 'loesche') {
        await doloescheCommand(interaction);
      } else if (subcommand === 'printselectmenu') {
        await doPrintSelectMenuCommand(interaction);
      }
    } catch (error) {
      console.log(error);
    }
  },
};

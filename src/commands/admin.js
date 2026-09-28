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
      }
    } catch (error) {
      console.log(error);
    }
  },
};

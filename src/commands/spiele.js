const {
  SlashCommandBuilder,
  InteractionContextType,
  MessageFlags,
} = require('discord.js');
const handleSpieleCommands = require('../utils/handleSpieleCommands.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spiele')
    .setDescription('Zeigt all deine Spiele-Bezogenen Daten.')
    .addSubcommand((subcommand) =>
      subcommand.setName('shop').setDescription('Zeigt den Item-Shop an.'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('use_item').setDescription('Benutze ein Item.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('gamestats')
        .setDescription('Zeigt all deine Spiele-Bezogenen Daten.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('eigene_tiere')
        .setDescription('Zeigt all deine Tiere.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('keks_essen')
        .setDescription('Schnellzugriff aufs Kekse essen.'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('leaderboard')
        .setDescription('Zeigt die Rangliste der Nutzer an.'),
    )
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction }) => {
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    if (!interaction.inGuild()) {
      interaction.reply('Hier ist doch kein Server!');
      return;
    }
    const subcommand = interaction.options.getSubcommand();
    if (
      interaction.channel.id != process.env.SPIELE_ID &&
      subcommand == 'gamestats'
    ) {
      await interaction.reply({
        content: `Dieser Befehl ist nur im Channel <#${process.env.SPIELE_ID} erlaubt!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (subcommand == 'shop') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      return await handleSpieleCommands.handleShop(interaction);
    } else if (subcommand == 'use_item') {
      return await handleSpieleCommands.handleUseItem(interaction);
    } else if (subcommand == 'gamestats') {
      return await handleSpieleCommands.handleGamestats(interaction);
    } else if (subcommand == 'eigene_tiere') {
      await interaction.deferReply();
      return await handleSpieleCommands.handleOwnAnimals(interaction);
    } else if (subcommand == 'keks_essen') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      return await handleSpieleCommands.handleKeksEssen(interaction);
    } else if (subcommand == 'leaderboard') {
      await interaction.deferReply();
      return await handleSpieleCommands.handleLeaderboard(interaction);
    }
  },
};

const {
  SlashCommandBuilder,
  InteractionContextType,
  MessageFlags,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require('discord.js');
const { confCache } = require('../utils/data/cache');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gluecksrad')
    .setDescription('Spiele um zu gewinnen oder zu verlieren.')
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction }) => {
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    try {
      if (
        confCache.get(interaction.guild.id) &&
        confCache.get(interaction.guild.id).get('MONEY_RAD_POOL') &&
        confCache.get(interaction.guild.id).get('MONEY_RAD_PERC') &&
        confCache.get(interaction.guild.id).get('MONEY_RAD_MAX_PERC') &&
        confCache.get(interaction.guild.id).get('MONEY_RAD_EINSATZ') &&
        Number(confCache.get(interaction.guild.id).get('MONEY_RAD_POOL')) > 0 &&
        Number(confCache.get(interaction.guild.id).get('MONEY_RAD_PERC')) > 0 &&
        Number(confCache.get(interaction.guild.id).get('MONEY_RAD_MAX_PERC')) >
          0 &&
        Number(confCache.get(interaction.guild.id).get('MONEY_RAD_EINSATZ')) > 0
      ) {
        const gluecksradBtn = new ButtonBuilder()
          .setLabel(
            `${confCache.get(interaction.guild.id).get('MONEY_RAD_EINSATZ')} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'} einsetzen?`,
          )
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`gluecksradBtn`);
        const firstRow = new ActionRowBuilder().addComponents(gluecksradBtn);
        await interaction.reply({
          components: [firstRow],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply('Das Glücksrad wurde nicht konfiguriert');
      }
    } catch (error) {
      console.log(error);
    }
  },
};

const { MessageFlags, EmbedBuilder } = require('discord.js');
const { serverConfCache } = require('../data/cache');
async function kummerkastenModal(interaction) {
  if (
    serverConfCache.get(interaction.guild.id) &&
    serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID')
  ) {
    const targetChannel =
      interaction.guild.channels.cache.get(
        serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID'),
      ) ||
      (await interaction.guild.channels.fetch(
        serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID'),
      ));
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const feedbackText = interaction.fields.getTextInputValue('feedback-input');
    const feedback = new EmbedBuilder();
    feedback.setColor(0x0033cc);
    feedback.setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ size: 256 }),
    });
    feedback.setTimestamp(Date.now());
    feedback.setTitle(`Neue Kummerkasten Nachricht`);
    feedback.setDescription(feedbackText);
    await targetChannel.send({ embeds: [feedback] });
    interaction.editReply('Nachricht eingeworfen!');
  }
}
module.exports = kummerkastenModal;

const { serverConfCache } = require('../../utils/data/cache');
const { EmbedBuilder, Message, AuditLogEvent, Client } = require('discord.js');
/**
 *
 * @param {Message} message
 * @param {Client} client
 * @returns
 */
module.exports = {
  run: async (message, client) => {
    console.log(`message deleted in ${message.channel}`);
    if (
      (message.author != null && (message.author.bot || message.webhookId)) ||
      (serverConfCache.get(message.guild.id) &&
        serverConfCache.get(message.guild.id).get('SPIELE_ID') &&
        message.channel.id ===
          serverConfCache.get(message.guild.id).get('SPIELE_ID') &&
        message.reference &&
        message.content.length == 1)
    )
      return;
    try {
      if (
        serverConfCache.get(message.guild.id) &&
        serverConfCache.get(message.guild.id).get('LOG_ID')
      ) {
        const targetChannel =
          message.guild.channels.cache.get(
            serverConfCache.get(message.guild.id).get('LOG_ID'),
          ) ||
          (await message.guild.channels.fetch(
            serverConfCache.get(message.guild.id).get('LOG_ID'),
          ));
        if (!targetChannel) {
          console.log('Fehler, Logchannel gibts nicht');
          return;
        }
        let user = client.user;
        if (message.author == null) {
          const logs = await message.guild.fetchAuditLogs({
            type: AuditLogEvent.MessageDelete,
            limit: 1,
          });
          const firstEntry = logs.entries.first();
          const { executorId } = firstEntry;
          user = await client.users.fetch(executorId);
          if (user.bot || message.webhookId) return;
        } else {
          if (
            message.guild.members.cache.find((m) => m.id === message.author.id)
              ?.id
          ) {
            user = message.author;
          }
        }
        let description = 'Nachricht war vor restart, leer oder ein Embed';
        if (message.content != null && message.content.length >= 1) {
          description = `${message.content}`;
          if (description.length > 1024) {
            description = description.substring(0, 1021) + '...';
          }
        }
        const messageDeleted = new EmbedBuilder();
        messageDeleted.setColor(0xff0000);
        messageDeleted.setAuthor({
          name: user.username,
          iconURL: user.displayAvatarURL({ size: 256 }),
        });
        messageDeleted.setTimestamp(Date.now());
        messageDeleted.setTitle(`Nachricht gelöscht in ${message.channel}`);
        messageDeleted.setDescription(description);
        targetChannel.send({ embeds: [messageDeleted] });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

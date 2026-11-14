const { Message } = require('discord.js');
const Vorstellung = require('../../models/Vorstellung');
const { serverConfCache } = require('../../utils/data/cache');
/**
 *
 * @param {Message} message
 * @returns
 */
module.exports = {
  run: async (message) => {
    if (
      serverConfCache.get(message.guild.id) &&
      serverConfCache.get(message.guild.id).get('VORSTELLUNG_ID') &&
      message.channel.id ===
        serverConfCache.get(message.guild.id).get('VORSTELLUNG_ID')
    ) {
      await Vorstellung.deleteOne({
        guildId: message.guild.id,
        userId: message.author.id,
        messageId: message.id,
      });
      console.log(
        `Vorstellung deleted for user ${message.author.tag} in guild ${message.guild.name}`,
      );
    }
  },
};

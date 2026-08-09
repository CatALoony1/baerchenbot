const aiMention = require('../../utils/messageC/aiMention');
const botMention = require('../../utils/messageC/botMention');
const bumpDone = require('../../utils/messageC/bumpDone');
const giveUserXp = require('../../utils/messageC/giveUserXp');
const hangman = require('../../utils/messageC/hangman');
const { serverConfCache } = require('../../utils/data/cache');

module.exports = {
  run: async (message, client) => {
    if (!message.inGuild() || message.webhookId) {
      return;
    }
    let gueltig = true;
    if (message.author.id === 'TODOJG_BUMP_MENTION') {
      await bumpDone(message);
    } else if (!message.author.bot) {
      if (message.content.includes('TODOJG_KI_MENTION')) {
        await aiMention(message);
      } else if (
        message.content.includes(client.user.id) &&
        message.content.includes('?')
      ) {
        await botMention(message);
      } else if (
        serverConfCache.get(message.guild.id) &&
        serverConfCache.get(message.guild.id).get('VCCREATION_ID') &&
        message.channel.id ===
          serverConfCache.get(message.guild.id).get('VCCREATION_ID')
      ) {
        gueltig = false;
        try {
          await message.delete();
        } catch (error) {
          console.log(error);
        }
      } else if (
        serverConfCache.get(message.guild.id) &&
        serverConfCache.get(message.guild.id).get('SPIELE_ID') &&
        message.channel.id ===
          serverConfCache.get(message.guild.id).get('SPIELE_ID') &&
        message.reference
      ) {
        await hangman(message);
      }
      if (gueltig) {
        await giveUserXp(message);
      }
    }
  },
};

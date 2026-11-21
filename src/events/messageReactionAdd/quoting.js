const {
  MessageReaction,
  User,
  MessageReactionEventDetails,
  AttachmentBuilder,
} = require('discord.js');
const { serverConfCache } = require('../../utils/data/cache');
const { createQuote } = require('../../utils/quoteGenerator');
/**
 *
 * @param {MessageReaction} reaction
 * @param {User} user
 * @param {MessageReactionEventDetails} details
 * @returns
 */
module.exports = {
  run: async (reaction, user, details) => {
    try {
      let fetchedReaction = reaction;
      if (fetchedReaction.partial) {
        fetchedReaction = await fetchedReaction.fetch();
      }
      if (fetchedReaction.emoji.name === '⭐' && fetchedReaction.count >= 3) {
        console.log(
          `Message ${fetchedReaction.message.id} has been starred by ${fetchedReaction.count} users!`,
        );
        if (
          serverConfCache.get(fetchedReaction.message.guild.id) &&
          serverConfCache.get(fetchedReaction.message.guild.id).get('QUOTE_ID')
        ) {
          const targetChannel =
            fetchedReaction.message.guild.channels.cache.get(
              serverConfCache
                .get(fetchedReaction.message.guild.id)
                .get('QUOTE_ID'),
            ) ||
            (await fetchedReaction.message.guild.channels.fetch(
              serverConfCache
                .get(fetchedReaction.message.guild.id)
                .get('QUOTE_ID'),
            ));
          /*const image = await createQuote({
            avatarURL: fetchedReaction.message.author.displayAvatarURL({
              extension: 'png',
              size: 512,
            }),
            quote: fetchedReaction.message.content,
            author: fetchedReaction.message.author.username,
          });
          const attachment = new AttachmentBuilder(image, {
            name: 'quote.png',
          });

          await targetChannel.send({
            files: [attachment],
          });*/
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};

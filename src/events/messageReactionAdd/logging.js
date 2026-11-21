const {
  MessageReaction,
  User,
  MessageReactionEventDetails,
} = require('discord.js');
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
      }
    } catch (error) {
      console.log(error);
    }
  },
};

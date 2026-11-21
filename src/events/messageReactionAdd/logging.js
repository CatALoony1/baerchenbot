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
      const fetchedReaction = await reaction.fetch();
      console.log(fetchedReaction);
    } catch (error) {
      console.log(error);
    }
  },
};

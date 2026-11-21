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
      console.log(reaction.count);
      console.log(reaction.emoji);
      console.log(reaction.countDetails);
    } catch (error) {
      console.log(error);
    }
  },
};

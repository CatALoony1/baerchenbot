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
      console.log(reaction.message.reactions);
      const message = await reaction.message.channel.messages.fetch(
        reaction.message.id,
      );
      console.log(message.reactions);
    } catch (error) {
      console.log(error);
    }
  },
};

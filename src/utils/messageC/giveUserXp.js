const { Message } = require('discord.js');
const giveXP = require('../giveXP');
const cooldowns = new Set();

/**
 *
 * @param {Message} message
 * @returns
 */
async function giveUserXp(message) {
  if (cooldowns.has(message.author.id)) {
    return;
  }
  const xpToGive = 5;
  await giveXP(message.member, xpToGive, message.channel, true);
  cooldowns.add(message.author.id);
  setTimeout(() => {
    cooldowns.delete(message.author.id);
  }, 15000); // Cooldown 15000 = 15sec
}
module.exports = giveUserXp;

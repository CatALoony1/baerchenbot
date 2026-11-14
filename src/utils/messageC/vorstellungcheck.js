const { Message } = require('discord.js');
const Vorstellung = require('../../models/Vorstellung');
/**
 *
 * @param {Message} message
 * @returns
 */
async function vorstellungcheck(message) {
  const existingEntry = await Vorstellung.findOne({
    guildId: message.guild.id,
    userId: message.author.id,
  });
  if (existingEntry) {
    await message.delete();
    return false;
  }
  const newEntry = new Vorstellung({
    guildId: message.guild.id,
    userId: message.author.id,
    messageId: message.id,
  });
  await newEntry.save();
  return true;
}
module.exports = vorstellungcheck;

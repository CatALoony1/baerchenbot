const Bump = require('../../models/Bump');
const Level = require('../../models/Level');
require('dotenv').config();
const { Message, EmbedBuilder } = require('discord.js');
const { confCache } = require('../data/cache');

/**
 *
 * @param {Message} message
 * @returns
 */
async function bumpDone(message) {
  if (
    message.embeds[0] != null &&
    message.embeds[0].description.includes('Bump erfolgreich')
  ) {
    const userid = message.interactionMetadata.user.id;
    const guildId = message.guild.id;
    const channel = message.channel;
    const level = await Level.findOne({
      userId: userid,
      guildId: guildId,
    });
    let newMessage = undefined;
    if (level) {
      level.lastBump = new Date();
      level.bumps += 1;
      level.save();
      const member = await message.guild.members.fetch(userid);
      if (!member.roles.cache.some((role) => role.name === 'Bumper')) {
        const role = message.guild.roles.cache.find(
          (role) => role.name === 'Bumper',
        );
        await member.roles.add(role);
      }
      const embed = new EmbedBuilder()
        .setTitle('Dankeschön für deine Untersützung!❤️')
        .setDescription(
          `Danke <@${userid}>, dass du den Server gebumpt hast. Um unsere Dankbarkeit zu zeigen bekommst du für 24 Stunden die Rolle **Bumper**, durch diese Rolle erhälst du einen Bonus von 10% auf jegliche erhaltene Erfahrung und 15% auf jegliche ${confCache.get(interaction.guild.id).get('MONEY_NAME')}!`,
        )
        .setThumbnail(
          member.user.displayAvatarURL({ format: 'png', dynamic: true }),
        )
        .setColor(0x0033cc);
      newMessage = await channel.send({ embeds: [embed] });
    }
    const query = {
      guildId: guildId,
    };
    let messageToReact = undefined;
    if (newMessage != undefined) {
      messageToReact = newMessage;
      await message.delete();
    } else {
      messageToReact = message;
    }
    try {
      const bumpEntry = await Bump.findOne(query);
      if (bumpEntry) {
        bumpEntry.endTime = Date.now() + 7200000;
        bumpEntry.reminded = 'N';
        if (bumpEntry.remindedId) {
          const remindedmessage = await channel.messages.fetch(
            bumpEntry.remindedId,
          );
          await remindedmessage.delete();
          bumpEntry.remindedId = undefined;
        }
        bumpEntry.save();
        console.log('Bump entry updated');
        messageToReact.react('⏰');
      } else {
        const newBump = new Bump({
          guildId: guildId,
          endTime: Date.now() + 7200000,
        });
        await newBump.save();
        console.log('Bump entry created');
        messageToReact.react('⏰');
      }
    } catch (error) {
      messageToReact.reply('Fehler bei erstellen des Bump Reminders.');
      console.log(error);
    }
  }
}
module.exports = bumpDone;

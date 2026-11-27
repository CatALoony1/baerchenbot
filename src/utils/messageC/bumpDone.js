const Bump = require('../../models/Bump');
const Level = require('../../models/Level');
const { Message, EmbedBuilder } = require('discord.js');
const { confCache } = require('../data/cache');
const getGifById = require('../getGifById');

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
      if (
        (confCache.get(guildId).get('BUMPTHX_HEADER') &&
          confCache.get(guildId).get('BUMPTHX_HEADER').length > 0) ||
        (confCache.get(guildId).get('BUMPTHX_GIF') &&
          confCache.get(guildId).get('BUMPTHX_GIF').length > 0) ||
        (confCache.get(guildId).get('BUMPTHX_TXT') &&
          confCache.get(guildId).get('BUMPTHX_TXT').length > 0)
      ) {
        let gifUrl = null;
        if (
          confCache.get(guildId).get('BUMPTHX_GIF') &&
          confCache.get(guildId).get('BUMPTHX_GIF').trim().length > 0
        ) {
          const gifUrl = await getGifById(
            confCache.get(guildId).get('BUMPTHX_GIF'),
          );
          if (!gifUrl.includes('http')) {
            console.log('ERROR bumpthx gif');
            console.log(gifUrl);
            gifUrl = null;
          }
        }
        let txt = confCache.get(guildId).get('BUMPTHX_TXT');
        let header = confCache.get(guildId).get('BUMPTHX_HEADER');

        const embed = new EmbedBuilder()
          .setThumbnail(
            member.user.displayAvatarURL({ format: 'png', dynamic: true }),
          )
          .setColor(0x0033cc);
        if (header && header.trim().length > 0) {
          embed.setTitle(
            header.replaceAll('[userPing]', `<@${guildMember.id}>`),
          );
        }
        if (txt && txt.trim().length > 0) {
          embed.setDescription(
            txt.replaceAll('[userPing]', `<@${guildMember.id}>`),
          );
        }
        if (gifUrl) {
          embed.setImage(gifUrl);
        }
        newMessage = await channel.send({
          embeds: [embed],
        });
      }
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

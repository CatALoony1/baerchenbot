const { EmbedBuilder } = require('discord.js');
const getGifById = require('../../utils/getGifById');
const { serverConfCache, confCache } = require('../../utils/data/cache');

/**
 *
 * @param {import {'discord.js'}.GuildMember} guildMember
 * @returns
 */
module.exports = {
  run: async (guildMember) => {
    if (guildMember.user.bot) return;
    console.log(`user ${guildMember.user.tag} left`);
    try {
      if (
        serverConfCache.get(guildMember.guild.id) &&
        serverConfCache.get(guildMember.guild.id).get('BYE_ID') &&
        ((confCache.get(guildMember.guild.id).get('BYE_HEADER') &&
          confCache.get(guildMember.guild.id).get('BYE_HEADER').length > 0) ||
          (confCache.get(guildMember.guild.id).get('BYE_GIF') &&
            confCache.get(guildMember.guild.id).get('BYE_GIF').length > 0) ||
          (confCache.get(guildMember.guild.id).get('BYE_TXT') &&
            confCache.get(guildMember.guild.id).get('BYE_TXT').length > 0))
      ) {
        const targetChannel =
          guildMember.guild.channels.cache.get(
            serverConfCache.get(guildMember.guild.id).get('BYE_ID'),
          ) ||
          (await guildMember.guild.channels.fetch(
            serverConfCache.get(guildMember.guild.id).get('BYE_ID'),
          ));
        if (!targetChannel) {
          console.log('Fehler, Verlassenschannel gibts nicht');
          return;
        }
        let gifUrl = null;
        if (
          confCache.get(guildMember.guild.id).get('BYE_GIF') &&
          confCache.get(guildMember.guild.id).get('BYE_GIF').trim().length > 0
        ) {
          gifUrl = await getGifById(
            confCache.get(guildMember.guild.id).get('BYE_GIF'),
          );
          if (!gifUrl.includes('http')) {
            console.log('ERROR Welcome gif');
            console.log(gifUrl);
            gifUrl = null;
          }
        }
        let txt = confCache.get(guildMember.guild.id).get('BYE_TXT');
        let header = confCache.get(guildMember.guild.id).get('BYE_HEADER');
        const members = await guildMember.guild.members.cache;
        const humanMemNum = members.filter((member) => !member.user.bot).size;
        const bye = new EmbedBuilder()
          .setColor(0x0033cc)
          .setAuthor({
            name: guildMember.user.username,
            iconURL: guildMember.user.displayAvatarURL({ size: 256 }),
          })
          .setFooter({
            text: `Da waren es nur noch ${humanMemNum}`,
          });
        if (header && header.trim().length > 0) {
          bye.setTitle(header.replaceAll('[userPing]', `<@${guildMember.id}>`));
        }
        if (txt && txt.trim().length > 0) {
          bye.setDescription(
            txt.replaceAll('[userPing]', `<@${guildMember.id}>`),
          );
        }
        if (gifUrl) {
          bye.setImage(gifUrl);
        }
        await targetChannel.send({
          embeds: [bye],
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

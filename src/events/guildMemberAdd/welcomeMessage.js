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
    console.log(`user ${guildMember.user.tag} joined`);
    const role = guildMember.guild.roles.cache.find(
      (role) => role.name === 'Begrüßungskomitee',
    );
    try {
      if (
        serverConfCache.get(guildMember.guild.id) &&
        serverConfCache.get(guildMember.guild.id).get('WELCOME_ID') &&
        confCache.get(guildMember.guild.id).get('WELCOME_HEADER') &&
        confCache.get(guildMember.guild.id).get('WELCOME_HEADER').length > 0
      ) {
        const targetChannel =
          guildMember.guild.channels.cache.get(
            serverConfCache.get(guildMember.guild.id).get('WELCOME_ID'),
          ) ||
          (await guildMember.guild.channels.fetch(
            serverConfCache.get(guildMember.guild.id).get('WELCOME_ID'),
          ));
        if (!targetChannel) {
          console.log('Fehler, Willkommenschannel gibts nicht');
          return;
        }
        let gifUrl = null;
        if (
          confCache.get(guildMember.guild.id).get('WELCOME_GIF') &&
          confCache.get(guildMember.guild.id).get('WELCOME_GIF').length > 0
        ) {
          const gifUrl = await getGifById(
            confCache.get(guildMember.guild.id).get('WELCOME_GIF'),
          );
          if (!gifUrl.includes('http')) {
            console.log('ERROR Welcome gif');
            console.log(gifUrl);
            gifUrl = null;
          }
        }
        const welcome = new EmbedBuilder()
          .setColor(0x0033cc)
          .setAuthor({
            name: guildMember.user.username,
            iconURL: guildMember.user.displayAvatarURL({ size: 256 }),
          })
          .setTitle(
            confCache
              .get(guildMember.guild.id)
              .get('WELCOME_HEADER')
              .replaceAll('[userPing]', `<@${guildMember.id}>`),
          );
        if (
          confCache.get(guildMember.guild.id).get('WELCOME_TXT') &&
          confCache.get(guildMember.guild.id).get('WELCOME_TXT').length > 0
        ) {
          welcome.setDescription(
            confCache
              .get(guildMember.guild.id)
              .get('WELCOME_TXT')
              .replaceAll('[userPing]', `<@${guildMember.id}>`),
          );
        }
        if (gifUrl) {
          welcome.setImage(gifUrl);
        }
        await targetChannel.send({
          content: `${role} <@${guildMember.id}>`,
          embeds: [welcome],
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

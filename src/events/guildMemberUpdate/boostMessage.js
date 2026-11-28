const { serverConfCache, confCache } = require('../../utils/data/cache');
const { EmbedBuilder } = require('discord.js');
const getGifById = require('../../utils/getGifById');

module.exports = {
  run: async (oldMember, newMember) => {
    const oldStatus = oldMember.premiumSince;
    const newStatus = newMember.premiumSince;
    if (!oldStatus && newStatus) {
      console.log(`user ${newMember.user.tag} boosted`);
      try {
        if (
          serverConfCache.get(newMember.guild.id) &&
          serverConfCache.get(newMember.guild.id).get('ALLGEMEIN_ID') &&
          ((confCache.get(newMember.guild.id).get('BOOST_HEADER') &&
            confCache.get(newMember.guild.id).get('BOOST_HEADER').length > 0) ||
            (confCache.get(newMember.guild.id).get('BOOST_GIF') &&
              confCache.get(newMember.guild.id).get('BOOST_GIF').length > 0) ||
            (confCache.get(newMember.guild.id).get('BOOST_TXT') &&
              confCache.get(newMember.guild.id).get('BOOST_TXT').length > 0))
        ) {
          const targetChannel =
            newMember.guild.channels.cache.get(
              serverConfCache.get(newMember.guild.id).get('ALLGEMEIN_ID'),
            ) ||
            (await newMember.guild.channels.fetch(
              serverConfCache.get(newMember.guild.id).get('ALLGEMEIN_ID'),
            ));
          if (!targetChannel) {
            console.log('Fehler, Verlassenschannel gibts nicht');
            return;
          }
          let gifUrl = null;
          if (
            confCache.get(newMember.guild.id).get('BOOST_GIF') &&
            confCache.get(newMember.guild.id).get('BOOST_GIF').trim().length > 0
          ) {
            gifUrl = await getGifById(
              confCache.get(newMember.guild.id).get('BOOST_GIF'),
            );
            if (!gifUrl.includes('http')) {
              console.log('ERROR Welcome gif');
              console.log(gifUrl);
              gifUrl = null;
            }
          }
          let txt = confCache.get(newMember.guild.id).get('BOOST_TXT');
          let header = confCache.get(newMember.guild.id).get('BOOST_HEADER');
          let ping = confCache.get(newMember.guild.id).get('BOOST_PING');
          if (txt && !header && !gif && !ping) {
            await targetChannel.send(
              txt.replaceAll('[userPing]', `<@${newMember.id}>`),
            );
          } else {
            const boost = new EmbedBuilder().setColor(0x0033cc).setAuthor({
              name: newMember.user.username,
              iconURL: newMember.user.displayAvatarURL({ size: 256 }),
            });
            if (header && header.trim().length > 0) {
              boost.setTitle(
                header.replaceAll('[userPing]', `<@${newMember.id}>`),
              );
            }
            if (txt && txt.trim().length > 0) {
              boost.setDescription(
                txt.replaceAll('[userPing]', `<@${newMember.id}>`),
              );
            }
            if (gifUrl) {
              boost.setImage(gifUrl);
            }
            let content = `<@${newMember.id}>`;
            if (ping && ping.length > 0) {
              content = `<@&${ping}> ${content}`;
            }
            await targetChannel.send({
              content: content,
              embeds: [boost],
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else if (oldStatus && !newStatus) {
      console.log(`user ${newMember.user.tag} removed boost`);
    }
  },
};

const { serverConfCache } = require('../../utils/data/cache');
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
          serverConfCache.get(newMember.guild.id).get('ALLGEMEIN_ID')
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
          const gifUrl = await getGifById('7zBKgiYsePlpvYyjYJ'); //Luna 8924450410500141730
          if (!gifUrl.includes('http')) {
            console.log('ERROR Boost gif');
            return;
          }
          const boost = new EmbedBuilder()
            .setColor(0x0033cc)
            .setAuthor({
              name: newMember.user.username,
              iconURL: newMember.user.displayAvatarURL({ size: 256 }),
            })
            .setTitle(`Danke für den Serverboost!❤️`)
            .setDescription(`Als Dank erhältst du 15% mehr Blattläuse und XP.`)
            .setImage(gifUrl);
          await targetChannel.send({
            content: `||<@${newMember.id}>||`,
            embeds: [boost],
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else if (oldStatus && !newStatus) {
      console.log(`user ${newMember.user.tag} removed boost`);
    }
  },
};

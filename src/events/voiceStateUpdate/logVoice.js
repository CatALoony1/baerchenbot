const { serverConfCache } = require('../../utils/data/cache');
const { EmbedBuilder, VoiceState } = require('discord.js');
const { startJob, stopJob, isRunning } = require('../../jobs/cronJob_voiceXp');

async function checkVoice(client) {
  let isTwoMembers = false;
  await client.channels.cache.forEach(async (channel) => {
    if (channel.type == 2 && channel.id != '1307820687599337602') {
      if (channel.members.size >= 2) {
        isTwoMembers = true;
      }
    }
  });
  if (isTwoMembers) {
    if (!isRunning()) {
      startJob(client);
    }
  } else {
    if (isRunning()) {
      stopJob();
    }
  }
}

/**
 *
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 * @returns
 */
module.exports = {
  run: async (oldState, newState, client) => {
    try {
      if (
        serverConfCache.get(newState.guild.id) &&
        serverConfCache.get(newState.guild.id).get('LOG_ID')
      ) {
        const targetChannel =
          newState.guild.channels.cache.get(
            serverConfCache.get(newState.guild.id).get('LOG_ID'),
          ) ||
          (await newState.guild.channels.fetch(
            serverConfCache.get(newState.guild.id).get('LOG_ID'),
          ));
        if (!targetChannel) {
          console.log('Fehler, Logchannel gibts nicht');
          return;
        }
        if (oldState.channel === newState.channel) return;
        const voiceUpdate = new EmbedBuilder();
        voiceUpdate.setAuthor({
          name: newState.member.user.username,
          iconURL: newState.member.user.displayAvatarURL({ size: 256 }),
        });
        voiceUpdate.setTimestamp(Date.now());
        if (newState.channel === null) {
          console.log(
            `user ${newState.member.user.tag} left voicechannel ${oldState.channel}`,
          );
          voiceUpdate.setColor(0xff0000);
          voiceUpdate.setTitle('Left Voicechannel');
          voiceUpdate.setDescription(`${oldState.channel}`);
        } else if (oldState.channel === null) {
          console.log(
            `user ${newState.member.user.tag} joined voicechannel ${newState.channel}`,
          );
          voiceUpdate.setColor(0x008000);
          voiceUpdate.setTitle('Joined Voicechannel');
          voiceUpdate.setDescription(`${newState.channel}`);
        } else {
          console.log(
            `user ${newState.member.user.tag} moved voicechannels ${oldState.channel} to ${newState.channel}`,
          );
          voiceUpdate.setColor(0x0033cc);
          voiceUpdate.setTitle('Moved Voicechannel');
          voiceUpdate.addFields({ name: 'von', value: `${oldState.channel}` });
          voiceUpdate.addFields({
            name: 'nach:',
            value: `${newState.channel}`,
          });
        }
        targetChannel.send({ embeds: [voiceUpdate] });
        await checkVoice(client);
      }
    } catch (error) {
      console.log(error);
    }
  },
};

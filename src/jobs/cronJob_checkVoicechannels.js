const cron = require('node-cron');
const VoiceChannel = require('../models/VoiceChannel');

let voiceChannelJob = null;

function startJob(client) {
  if (voiceChannelJob) {
    console.log('VoiceChannel-Job is already running.');
    return;
  }
  voiceChannelJob = cron.schedule('0 * * * *', async function () {
    console.log(`VoiceChannel-Job started...`);
    const query = {
      permanent: false,
    };
    try {
      const channels = await VoiceChannel.find(query);
      for (const channel of channels) {
        if (Date.now() - channel.creationTime.getTime() > 60 * 60 * 1000) {
          const voiceChannel = await client.channels.fetch(channel.channelId);
          if (voiceChannel.members.size == 0) {
            await voiceChannel.delete();
            await VoiceChannel.deleteOne({ channelId: channel.channelId });
            console.log(
              `Deleted voice channel ${channel.name} and database entry.`,
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  console.log('VoiceChannel-Job started.');
}

function stopJob() {
  if (voiceChannelJob) {
    voiceChannelJob.stop();
    voiceChannelJob = null;
    console.log('VoiceChannel-Job stopped.');
  } else {
    console.log('VoiceChannel-Job is not running.');
  }
}

function isRunning() {
  return voiceChannelJob !== null;
}

module.exports = {
  startJob,
  stopJob,
  isRunning,
};

/*
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )

  * = jede

*/

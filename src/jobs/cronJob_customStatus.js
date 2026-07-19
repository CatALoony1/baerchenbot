const { ActivityType } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();
let status = [
  /*
  {
    activities: [{
      name: 'Platzhalter',
      type: ActivityType.Streaming,
      url: 'https://www.youtube.com/watch?v=k0jvsZ6HQOM'
    }], status: 'online'
  },
  {
    activities: [{
      name: 'Platzhalter',
      type: ActivityType.Custom
    }], status: 'dnd'
  },
  {
    activities: [{
      name: 'Platzhalter',
      type: ActivityType.Competing
    }], status: 'dnd'
  }, 
  {
    activities: [
      {
        name: 'Platzhalter',
        type: ActivityType.Listening,
      },
    ],
    status: 'idle',
  },
  {
    activities: [
      {
        name: 'Platzhalter',
        type: ActivityType.Watching,
      },
    ],
    status: 'online',
  },
  {
    activities: [
      {
        name: 'Platzhalter',
        type: ActivityType.Playing,
      },
    ],
    status: 'online',
  },
  */
  {
    activities: [
      {
        name: 'Schläft...',
        type: ActivityType.Custom,
      },
    ],
    status: 'idle',
  },
];

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let customStatusJob = null;

function startJob(client) {
  if (customStatusJob) {
    console.log('CustomStatus-Job is already running.');
    return;
  }
  customStatusJob = cron.schedule('* * * * *', async function () {
    //30sec
    try {
      await client.user.setPresence(status[getRandom(0, status.length - 1)]);
    } catch (error) {
      console.log(error);
    }
  });
  console.log('CustomStatus-Job started.');
}

function stopJob() {
  if (customStatusJob) {
    customStatusJob.stop();
    customStatusJob = null;
    console.log('CustomStatus-Job stopped.');
  } else {
    console.log('CustomStatus-Job is not running.');
  }
}

function isRunning() {
  return customStatusJob !== null;
}

module.exports = {
  startJob,
  stopJob,
  isRunning,
};

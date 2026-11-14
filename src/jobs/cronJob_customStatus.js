const { ActivityType } = require('discord.js');
const cron = require('node-cron');
let status = [
  /*
  {
    activities: [{
      name: 'Serverhymne',
      type: ActivityType.Streaming,
      url: 'https://www.youtube.com/watch?v=k0jvsZ6HQOM'
    }], status: 'online'
  },
  {
    activities: [{
      name: 'Unterwasserdokumentation',
      type: ActivityType.Watching
    }], status: 'online'
  },
  {
    activities: [{
      name: 'dem Rauschen der Wellen',
      type: ActivityType.Listening
    }], status: 'idle'
  },
  {
    activities: [{
      name: 'cooking simulator',
      type: ActivityType.Playing
    }], status: 'online'
  },
  {
    activities: [{
      name: 'Erhöht die Preise',
      type: ActivityType.Custom
    }], status: 'dnd'
  },
  {
    activities: [{
      name: 'Schatzsuche',
      type: ActivityType.Competing
    }], status: 'dnd'
  }, 

  */
  {
    activities: [
      {
        name: 'erhöht die Preise',
        type: ActivityType.Custom,
      },
    ],
    status: 'dnd',
  },
  {
    activities: [
      {
        name: 'wartet auf das Essen',
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  },
  {
    activities: [
      {
        name: 'schläft...',
        type: ActivityType.Custom,
      },
    ],
    status: 'idle',
  },
  {
    activities: [
      {
        name: 'erobert die Weltherrschaft',
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  },
  {
    activities: [
      {
        name: 'sieht Jonas beim Arbeiten zu',
        type: ActivityType.Custom,
      },
    ],
    status: 'idle',
  },
  {
    activities: [
      {
        name: 'schaut zu viel Anime',
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  },
  {
    activities: [
      {
        name: 'macht ein Kaffeepäuschen',
        type: ActivityType.Custom,
      },
    ],
    status: 'dnd',
  },
  {
    activities: [
      {
        name: 'buddelt ein Loch',
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  },
  {
    activities: [
      {
        name: 'auf der Suche nach Honig',
        type: ActivityType.Custom,
      },
    ],
    status: 'online',
  },
  {
    activities: [
      {
        name: 'zählt Schäfchen',
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

require('dotenv').config();
const cron = require('node-cron');

let newYearJob = null;

function startJob(client) {
  if (newYearJob) {
    console.log('NewYear-Job is already running.');
    return;
  }
  newYearJob = cron.schedule('0 0 1 1 *', async function () {
    const guilds = await client.guilds.cache;
    for (const guild of guilds) {
      const targetChannel = await client.channels.fetch(
        process.env.ALLGEMEIN_ID,
      );
      targetChannel.send(
        `Ich wünsche euch ein schönes und erfolgreiches neues Jahr!`,
      );
    }
  });
  console.log('NewYear-Job started.');
}

function stopJob() {
  if (newYearJob) {
    newYearJob.stop();
    newYearJob = null;
    console.log('NewYear-Job stopped.');
  } else {
    console.log('NewYear-Job is not running.');
  }
}

function isRunning() {
  return newYearJob !== null;
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

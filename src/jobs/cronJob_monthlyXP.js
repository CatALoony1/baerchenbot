const cron = require('node-cron');
const Level = require('../models/Level');
require('dotenv').config();

let monthlyXpJob = null;

function startJob(client) {
  if (monthlyXpJob) {
    console.log('MonthlyXp-Job is already running.');
    return;
  }
  monthlyXpJob = cron.schedule('0 0 1 * *', async function () {
    console.log('Started deleting monthly XP');
    const guilds = await client.guilds.cache;
    for (const guild of guilds) {
      try {
        const fetchedLevel = await Level.find({
          guildId: guild.id,
        });
        fetchedLevel.forEach(async (level) => {
          level.lastmonth = level.thismonth;
          level.thismonth = 0;
          await level.save();
        });
      } catch (error) {
        console.log(error);
      }
    }
    console.log('Finished deleting monthly XP');
  });
  console.log('MonthlyXp-Job started.');
}

function stopJob() {
  if (monthlyXpJob) {
    monthlyXpJob.stop();
    monthlyXpJob = null;
    console.log('MonthlyXp-Job stopped.');
  } else {
    console.log('MonthlyXp-Job is not running.');
  }
}

function isRunning() {
  return monthlyXpJob !== null;
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

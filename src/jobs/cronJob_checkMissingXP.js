const cron = require('node-cron');
const Level = require('../models/Level');
require('dotenv').config();

let missingXpJob = null;

function startJob(client) {
  if (missingXpJob) {
    console.log('MissingXp-Job is already running.');
    return;
  }
  missingXpJob = cron.schedule('*/6 * * * *', async function () {
    console.log('Started checking for missing XP');
    const guilds = await client.guilds.cache;
    for (const guild of guilds) {
      const guildId = guild.id;
      try {
        const fetchedLevel = await Level.find({
          guildId: guildId,
        });
        let missingXPUsers = [];
        fetchedLevel.forEach(async (level) => {
          const xpToHave =
            ((level.level * (level.level + 1)) / 2) * 100 + level.xp;
          if (level.allxp != xpToHave) {
            if (level.allxp > xpToHave) {
              const missingXP = level.allxp - xpToHave;
              console.log(`User ${level.userName} is missing ${missingXP} XP`);
              level.xp += missingXP;
            } else {
              const missingXP = xpToHave - level.allxp;
              console.log(
                `User ${level.userName} is missing ${missingXP} allXP`,
              );
              level.allxp += missingXP;
            }
            missingXPUsers[missingXPUsers.length] = level.userName;
            await level.save();
          }
        });
        if (missingXPUsers.length > 0) {
          const targetChannel = await client.channels.fetch(process.env.LOG_ID);
          targetChannel.send(
            `Missing XP for users: ${missingXPUsers.join(', ')}`,
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
    console.log('Finished checking for missing XP');
  });
  console.log('MissingXp-Job started.');
}

function stopJob() {
  if (missingXpJob) {
    missingXpJob.stop();
    missingXpJob = null;
    console.log('MissingXp-Job stopped.');
  } else {
    console.log('MissingXp-Job is not running.');
  }
}

function isRunning() {
  return missingXpJob !== null;
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

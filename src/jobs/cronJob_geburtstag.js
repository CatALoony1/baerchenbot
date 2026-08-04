require('dotenv').config();
const cron = require('node-cron');
const Level = require('../models/Level');
const giveMoney = require('../utils/giveMoney');

let geburtstagJob = null;

function startJob(client) {
  if (geburtstagJob) {
    console.log('Geburtstag-Job is already running.');
    return;
  }
  geburtstagJob = cron.schedule('0 0 * * *', async function () {
    await jobFunction(client).catch((error) => {
      console.log(error);
    });
  });
  console.log('Geburtstag-Job started.');
}

function stopJob() {
  if (geburtstagJob) {
    geburtstagJob.stop();
    geburtstagJob = null;
    console.log('Geburtstag-Job stopped.');
  } else {
    console.log('Geburtstag-Job is not running.');
  }
}

function isRunning() {
  return geburtstagJob !== null;
}

async function jobFunction(client) {
  const guilds = await client.guilds.cache;
  for (const guild of guilds) {
    const targetChannel = await client.channels.fetch(process.env.ALLGEMEIN_ID);
    const allLevels = await Level.find({
      guildId: guild.id,
    });
    let oldUsers = [];
    for (let j = 0; j < allLevels.length; j++) {
      if (!guild.members.cache.find((m) => m.id === allLevels[j].userId)?.id) {
        oldUsers[oldUsers.length] = j;
      }
    }
    for (let j = 0; j < oldUsers.length; j++) {
      allLevels.splice(oldUsers[j] - j, 1);
    }
    for (const level of allLevels) {
      if (level.geburtstag) {
        const birthdayDate = new Date(level.geburtstag);
        const today = new Date();
        if (
          birthdayDate.getDate() === today.getDate() &&
          birthdayDate.getMonth() === today.getMonth()
        ) {
          const age = today.getFullYear() - birthdayDate.getFullYear();
          targetChannel.send(
            `Herzlichen Glückwunsch an <@${level.userId}>! Heute ist dein Geburtstag und du bist jetzt ${age} Jahre alt! 🎉`,
          );
          giveMoney(guild.members.cache.get(level.userId), 50000).catch(
            (error) => {
              console.log(`Error giving money to user ${level.userId}:`, error);
            },
          );
        }
      }
    }
  }
}

module.exports = {
  startJob,
  stopJob,
  isRunning,
  jobFunction,
};

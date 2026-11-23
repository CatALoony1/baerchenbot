const cron = require('node-cron');
const GameUser = require('../models/GameUser.js');
const Bankkonten = require('../models/Bankkonten.js');

let checkInactiveJob = null;

function startJob(client) {
  if (checkInactiveJob) {
    console.log('CheckInactive-Job is already running.');
    return;
  }
  checkInactiveJob = cron.schedule('10 0 * * *', async function () {
    // 0:10 Uhr
    console.log(`CheckInactive-Job started...`);
    try {
      const bankkontenZinsen = await Bankkonten.find({
        zinsProzent: { $ne: 0 },
      });
      if (bankkontenZinsen.length > 0) {
        for (const bankkonto of bankkontenZinsen) {
          const user = await GameUser.findById(bankkonto.besitzer);
          if (!user) continue;
          const member = await client.guilds.cache
            .get(user.guildId)
            ?.members.fetch(user.userId)
            .catch(() => null);
          if (!member) continue;
          let zinsen = Math.floor(
            (bankkonto.currentMoney * bankkonto.zinsProzent) / 100,
          );
          if (
            member.roles.cache.some((role) => role.name === 'Server Booster')
          ) {
            zinsen = Math.ceil(zinsen * 1.15);
          }
          bankkonto.currentMoney += zinsen;
          bankkonto.moneyGain += zinsen;
          await bankkonto.save();
          console.log(
            `Zinsen von ${zinsen} für User ${user.userId} hinzugefügt.`,
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
    console.log(`CheckInactive-Job finished...`);
  });
  console.log('CheckInactive-Job started.');
}

function stopJob() {
  if (checkInactiveJob) {
    checkInactiveJob.stop();
    checkInactiveJob = null;
    console.log('CheckInactive-Job stopped.');
  } else {
    console.log('CheckInactive-Job is not running.');
  }
}

function isRunning() {
  return checkInactiveJob !== null;
}

module.exports = {
  startJob,
  stopJob,
  isRunning,
};

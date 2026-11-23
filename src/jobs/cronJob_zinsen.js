const cron = require('node-cron');
const GameUser = require('../models/GameUser.js');
const Bankkonten = require('../models/Bankkonten.js');
const { serverConfCache, confCache } = require('../utils/data/cache');

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
            confCache.get(member.guild.id) &&
            serverConfCache.get(member.guild.id) &&
            confCache.get(member.guild.id).get('MONEY_BOOSTER_PERC') &&
            Number(confCache.get(member.guild.id).get('MONEY_BOOSTER_PERC')) >
              0 &&
            serverConfCache.get(member.guild.id).get('BOOSTER_ROLE_ID') &&
            member.roles.cache.some(
              (role) =>
                role.id ===
                serverConfCache.get(member.guild.id).get('BOOSTER_ROLE_ID'),
            )
          ) {
            zinsen = Math.ceil(
              zinsen *
                ((100 +
                  Number(
                    confCache.get(member.guild.id).get('MONEY_BOOSTER_PERC'),
                  )) /
                  100),
            );
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

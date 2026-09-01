const cron = require('node-cron');
const ActiveItems = require('../models/ActiveItems.js');
const Config = require('../models/Config.js');
const removeMoney = require('../utils/removeMoney.js');
const giveMoney = require('../utils/giveMoney.js');
const getGifById = require('../utils/getGifById.js');
const { serverConfCache } = require('../utils/data/cache');
const { confCache } = require('../utils/data/cache');
const GameUser = require('../models/GameUser.js');
require('../models/Bankkonten.js');

let checkActiveItemsJob = null;

function startJob(client) {
  if (checkActiveItemsJob) {
    console.log('CheckActiveItems-Job is already running.');
    return;
  }
  checkActiveItemsJob = cron.schedule('*/5 * * * *', async function () {
    const guilds = await client.guilds.cache;
    for (const guild of guilds) {
      try {
        if (
          serverConfCache.get(guild.id) &&
          serverConfCache.get(guild.id).get('SPIELE_ID') &&
          serverConfCache.get(guild.id).get('ALLGEMEIN_ID')
        ) {
          const activeItems = await ActiveItems.find({});
          const targetChannel =
            guild.channels.cache.get(
              serverConfCache.get(guild.id).get('SPIELE_ID'),
            ) ||
            (await guild.channels.fetch(
              serverConfCache.get(guild.id).get('SPIELE_ID'),
            ));
          const mainChannel =
            guild.channels.cache.get(
              serverConfCache.get(guild.id).get('ALLGEMEIN_ID'),
            ) ||
            (await guild.channels.fetch(
              serverConfCache.get(guild.id).get('ALLGEMEIN_ID'),
            ));
          const toBeDeleted = [];
          if (activeItems && activeItems.length > 0) {
            for (const activeItem of activeItems) {
              if (activeItem.endTime < new Date()) {
                toBeDeleted.push(activeItem._id);
                if (activeItem.itemType == 'Bombe') {
                  const amount = getRandom(20000, 40000);
                  const usedOnObj =
                    (await guild.members.cache.get(activeItem.usedOn)) ||
                    (await guild.members.fetch(activeItem.usedOn));
                  if (usedOnObj) {
                    await removeMoney(usedOnObj, amount);
                    const gifUrl = await getGifById('mZryFzM65MtpJ5fOMj');
                    if (!gifUrl.includes('http')) {
                      console.log('ERROR Bombe gif');
                      return;
                    }
                    await targetChannel.send({
                      content: `Bei <@${activeItem.usedOn}> ist eine Bombe explodiert! **${amount}** ${confCache.get(guild.id).get('MONEY_NAME')} sind verpufft!`,
                      files: [gifUrl],
                    });
                  }
                } else if (activeItem.itemType == 'Doppelte XP') {
                  const xpMultiplier = await Config.findOne({
                    key: 'xpMultiplier',
                    guildId: guild.id,
                  });
                  if (!xpMultiplier) {
                    await Config.create({
                      name: 'key',
                      value: 1,
                      guildId: guild.id,
                    });
                  } else {
                    xpMultiplier.value = '1';
                    await xpMultiplier.save();
                  }
                  await mainChannel.send(
                    'Die Doppelte XP sind nun abgelaufen.',
                  );
                } else if (activeItem.itemType == 'Schuldschein') {
                  await targetChannel.send(
                    `<@${activeItem.user}> dein Schuldschein bei <@${activeItem.usedOn}> ist nun abgelaufen.`,
                  );
                } else if (activeItem.itemType == 'Oberster Platz') {
                  const targetUserObj = await guild.members.fetch(
                    activeItem.user,
                  );
                  const role =
                    guild.roles.cache.get('1387041004179296439') ||
                    (await guild.roles.fetch('1387041004179296439'));
                  if (!role || !targetUserObj) {
                    console.log(
                      'ERROR Job Oberster Platz: Cant find User or Role',
                    );
                  } else {
                    await targetUserObj.roles.remove(role);
                  }
                }
              } else if (activeItem.itemType == 'Schuldschein') {
                if (activeItem.extras != new Date().toLocaleDateString()) {
                  activeItem.extras = new Date().toLocaleDateString();
                  await activeItem.save();
                  const userObj =
                    (await guild.members.cache.get(activeItem.user)) ||
                    (await guild.members.fetch(activeItem.user));
                  const usedOnObj =
                    (await guild.members.cache.get(activeItem.usedOn)) ||
                    (await guild.members.fetch(activeItem.usedOn));
                  if (userObj && usedOnObj) {
                    const usedOnGameUser = await GameUser.findOne({
                      userId: activeItem.usedOn,
                      guildId: guild.id,
                    }).populate('bankkonto');
                    if (usedOnGameUser && usedOnGameUser.bankkonto) {
                      await removeMoney(
                        usedOnObj,
                        usedOnGameUser.bankkonto.currentMoney * 0.01,
                      );
                      await giveMoney(userObj, 1000);
                      await targetChannel.send(
                        `Von <@${activeItem.usedOn}> wurden 1000 ${confCache.get(guild.id).get('MONEY_NAME')} Schulden an <@${activeItem.user}> übergeben.`,
                      );
                    } else {
                      await targetChannel.send(
                        `<@${activeItem.usedOn}> hat kein Bankkonto, daher konnte der Schuldschein nicht ausgeführt werden. Ganz schön blöd für <@${activeItem.user}>.`,
                      );
                    }
                  }
                }
              }
            }
            if (toBeDeleted.length > 0) {
              await ActiveItems.deleteMany({ _id: { $in: toBeDeleted } });
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
  console.log('CheckActiveItems-Job started.');
}

function stopJob() {
  if (checkActiveItemsJob) {
    checkActiveItemsJob.stop();
    checkActiveItemsJob = null;
    console.log('CheckActiveItems-Job stopped.');
  } else {
    console.log('CheckActiveItems-Job is not running.');
  }
}

function isRunning() {
  return checkActiveItemsJob !== null;
}

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

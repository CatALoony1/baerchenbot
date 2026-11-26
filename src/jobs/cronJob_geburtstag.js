const { serverConfCache, confCache } = require('../utils/data/cache');
const cron = require('node-cron');
const Level = require('../models/Level');
const giveMoney = require('../utils/giveMoney');
const { EmbedBuilder } = require('discord.js');
const getGifById = require('../utils/getGifById');

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
    if (
      serverConfCache.get(guild.id) &&
      serverConfCache.get(guild.id).get('ALLGEMEIN_ID') &&
      ((confCache.get(guild.id).get('BIRTH_HEADER') &&
        confCache.get(guild.id).get('BIRTH_HEADER').length > 0) ||
        (confCache.get(guild.id).get('BIRTH_GIF') &&
          confCache.get(guild.id).get('BIRTH_GIF').length > 0) ||
        (confCache.get(guild.id).get('BIRTH_TXT') &&
          confCache.get(guild.id).get('BIRTH_TXT').length > 0))
    ) {
      const targetChannel = await client.channels.fetch(
        serverConfCache.get(guild.id).get('ALLGEMEIN_ID'),
      );
      const allLevels = await Level.find({
        guildId: guild.id,
      });
      let oldUsers = [];
      for (let j = 0; j < allLevels.length; j++) {
        if (
          !guild.members.cache.find((m) => m.id === allLevels[j].userId)?.id
        ) {
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
            let gifUrl = null;
            if (
              confCache.get(guild.id).get('BIRTH_GIF') &&
              confCache.get(guild.id).get('BIRTH_GIF').trim().length > 0
            ) {
              const gifUrl = await getGifById(
                confCache.get(guild.id).get('BIRTH_GIF'),
              );
              if (!gifUrl.includes('http')) {
                console.log('ERROR Welcome gif');
                console.log(gifUrl);
                gifUrl = null;
              }
            }
            let txt = confCache.get(guild.id).get('BIRTH_TXT');
            let header = confCache.get(guild.id).get('BIRTH_HEADER');
            let ping = confCache.get(guild.id).get('BIRTH_PING');
            const member = guild.members.cache.get(level.userId);
            if (txt && !header && !gif && !ping) {
              await targetChannel.send(
                txt
                  .replaceAll('[userPing]', `<@${level.userId}>`)
                  .replaceAll('[oldAge]', age - 1)
                  .replaceAll('[newAge]', age)
                  .replaceAll('[birthDate]', birthdayDate),
              );
            } else {
              const birthdayEmb = new EmbedBuilder()
                .setColor(0x0033cc)
                .setAuthor({
                  name: member.user.username,
                  iconURL: member.user.displayAvatarURL({ size: 256 }),
                });
              if (header && header.trim().length > 0) {
                birthdayEmb.setTitle(
                  header
                    .replaceAll('[userPing]', `<@${level.userId}>`)
                    .replaceAll('[oldAge]', age - 1)
                    .replaceAll('[newAge]', age)
                    .replaceAll('[birthDate]', birthdayDate),
                );
              }
              if (txt && txt.trim().length > 0) {
                birthdayEmb.setDescription(
                  txt
                    .replaceAll('[userPing]', `<@${level.userId}>`)
                    .replaceAll('[oldAge]', age - 1)
                    .replaceAll('[newAge]', age)
                    .replaceAll('[birthDate]', birthdayDate),
                );
              }
              if (gifUrl) {
                birthdayEmb.setImage(gifUrl);
              }
              let content = `<@${level.userId}>`;
              if (ping && ping.length > 0) {
                content = `<@&${ping}> ${content}`;
              }
              await targetChannel.send({
                content: content,
                embeds: [birthdayEmb],
              });
            }
            if (
              confCache.get(guild.id) &&
              confCache.get(guild.id).get(MONEY_BIRTHDAY) &&
              Number(confCache.get(guild.id).get(MONEY_BIRTHDAY)) > 0
            ) {
              giveMoney(
                member,
                Number(confCache.get(guild.id).get(MONEY_BIRTHDAY)),
              ).catch((error) => {
                console.log(
                  `Error giving money to user ${level.userId}:`,
                  error,
                );
              });
            }
          }
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

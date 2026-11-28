const { serverConfCache, confCache } = require('../utils/data/cache');
const { EmbedBuilder } = require('discord.js');
const getGifById = require('../utils/getGifById');
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
      if (
        serverConfCache.get(guild.id) &&
        serverConfCache.get(guild.id).get('ALLGEMEIN_ID') &&
        ((confCache.get(guild.id).get('YEAR_HEADER') &&
          confCache.get(guild.id).get('YEAR_HEADER').length > 0) ||
          (confCache.get(guild.id).get('YEAR_GIF') &&
            confCache.get(guild.id).get('YEAR_GIF').length > 0) ||
          (confCache.get(guild.id).get('YEAR_TXT') &&
            confCache.get(guild.id).get('YEAR_TXT').length > 0))
      ) {
        const targetChannel = await client.channels.fetch(
          serverConfCache.get(guild.id).get('ALLGEMEIN_ID'),
        );
        let gifUrl = null;
        if (
          confCache.get(guild.id).get('YEAR_GIF') &&
          confCache.get(guild.id).get('YEAR_GIF').trim().length > 0
        ) {
          gifUrl = await getGifById(confCache.get(guild.id).get('YEAR_GIF'));
          if (!gifUrl.includes('http')) {
            console.log('ERROR Welcome gif');
            console.log(gifUrl);
            gifUrl = null;
          }
        }
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Berlin',
          year: 'numeric',
        });

        const currentYear = Number(formatter.format(new Date()));
        const previousYear = currentYear - 1;
        let txt = confCache.get(guild.id).get('YEAR_TXT');
        let header = confCache.get(guild.id).get('YEAR_HEADER');
        if (txt && !header && !gif) {
          await targetChannel.send(
            txt
              .replaceAll('[newYear]', currentYear)
              .replaceAll('[oldYear', previousYear),
          );
        } else {
          const newYear = new EmbedBuilder().setColor(0x0033cc).setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL({ size: 256 }),
          });
          if (header && header.trim().length > 0) {
            newYear.setTitle(
              header
                .replaceAll('[newYear]', currentYear)
                .replaceAll('[oldYear', previousYear),
            );
          }
          if (txt && txt.trim().length > 0) {
            newYear.setDescription(
              txt
                .replaceAll('[newYear]', currentYear)
                .replaceAll('[oldYear', previousYear),
            );
          }
          if (gifUrl) {
            newYear.setImage(gifUrl);
          }
          await targetChannel.send({
            embeds: [newYear],
          });
        }
      }
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

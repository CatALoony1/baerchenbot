const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const Bump = require('../models/Bump');
const getGifById = require('../utils/getGifById');
const { serverConfCache, confCache } = require('../utils/data/cache');

let bumpReminderJob = null;

function startJob(client) {
  if (bumpReminderJob) {
    console.log('BumpReminder-Job is already running.');
    return;
  }
  bumpReminderJob = cron.schedule('* * * * *', async function () {
    const guilds = await client.guilds.cache;
    for (const guild of guilds) {
      const guildId = guild.id;
      const query = {
        guildId: guildId,
      };
      try {
        if (
          serverConfCache.get(guildId) &&
          serverConfCache.get(guildId).get('BUMP_ID') &&
          ((confCache.get(guildId).get('BUMPREM_HEADER') &&
            confCache.get(guildId).get('BUMPREM_HEADER').length > 0) ||
            (confCache.get(guildId).get('BUMPREM_GIF') &&
              confCache.get(guildId).get('BUMPREM_GIF').length > 0) ||
            (confCache.get(guildId).get('BUMPREM_TXT') &&
              confCache.get(guildId).get('BUMPREM_TXT').length > 0))
        ) {
          const bumpEntry = await Bump.findOne(query);
          if (bumpEntry) {
            if (bumpEntry.endTime < Date.now() && bumpEntry.reminded === 'N') {
              const targetChannel =
                guild.channels.cache.get(
                  serverConfCache.get(guildId).get('BUMP_ID'),
                ) ||
                (await guild.channels.fetch(
                  serverConfCache.get(guildId).get('BUMP_ID'),
                ));
              if (!targetChannel) {
                console.log('ERROR Bump channel');
                continue;
              }
              let gifUrl = null;
              if (
                confCache.get(guildId).get('BUMPREM_GIF') &&
                confCache.get(guildId).get('BUMPREM_GIF').trim().length > 0
              ) {
                const gifUrl = await getGifById(
                  confCache.get(guildId).get('BUMPREM_GIF'),
                );
                if (!gifUrl.includes('http')) {
                  console.log('ERROR Welcome gif');
                  console.log(gifUrl);
                  gifUrl = null;
                }
              }
              let txt = confCache.get(guildId).get('BUMPREM_TXT');
              let header = confCache.get(guildId).get('BUMPREM_HEADER');
              let ping = confCache.get(guildId).get('BUMPREM_PING');
              if (txt && !header && !gif && !ping) {
                await targetChannel.send(
                  txt.replaceAll('[userPing]', `<@${newMember.id}>`),
                );
              } else {
                const bump = new EmbedBuilder().setColor(0x0033cc);
                if (header && header.trim().length > 0) {
                  bump.setTitle(
                    header.replaceAll('[userPing]', `<@${newMember.id}>`),
                  );
                }
                if (txt && txt.trim().length > 0) {
                  bump.setDescription(
                    txt.replaceAll('[userPing]', `<@${newMember.id}>`),
                  );
                }
                if (gifUrl) {
                  bump.setImage(gifUrl);
                }
                if (ping && ping.length > 0) {
                  await targetChannel.send({
                    content: `<@&${ping}>`,
                    embeds: [bump],
                  });
                } else {
                  await targetChannel.send({
                    content: content,
                    embeds: [bump],
                  });
                }
              }
              console.log('Bump reminded');
              bumpEntry.remindedId = message.id;
              bumpEntry.reminded = 'J';
              bumpEntry.save();
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
  console.log('BumpReminder-Job started.');
}

function stopJob() {
  if (bumpReminderJob) {
    bumpReminderJob.stop();
    bumpReminderJob = null;
    console.log('BumpReminder-Job stopped.');
  } else {
    console.log('BumpReminder-Job is not running.');
  }
}

function isRunning() {
  return bumpReminderJob !== null;
}

module.exports = {
  startJob,
  stopJob,
  isRunning,
};

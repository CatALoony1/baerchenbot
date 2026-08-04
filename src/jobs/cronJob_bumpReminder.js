const Discord = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();
const Bump = require('../models/Bump');
const getGifById = require('../utils/getGifById');

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
        const bumpEntry = await Bump.findOne(query);
        if (bumpEntry) {
          if (bumpEntry.endTime < Date.now() && bumpEntry.reminded === 'N') {
            let role = guild.roles.cache.find(
              (role) => role.name === 'Bump-Ping',
            );
            const gifUrl = await getGifById('SQD2LlZy731O8');
            if (!gifUrl.includes('http')) {
              console.log('ERROR Bump gif');
              return;
            }
            const bump = new Discord.EmbedBuilder()
              .setColor(0x0033cc)
              .setTitle('Es ist Zeit zu bumpen!')
              .setImage(gifUrl);
            const targetChannel = await client.channels.fetch(
              process.env.BUMP_ID,
            );
            const message = await targetChannel.send({
              content: `${role}`,
              embeds: [bump],
            });
            console.log('Bump reminded');
            bumpEntry.remindedId = message.id;
            bumpEntry.reminded = 'J';
            bumpEntry.save();
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

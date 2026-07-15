const bumpReminderJob = require('../../jobs/cronJob_bumpReminder');
const checkBumperRoleJob = require('../../jobs/cronJob_checkBumperRole');
const checkInactiveJob = require('../../jobs/cronJob_checkInactive');
const customStatusJob = require('../../jobs/cronJob_customStatus');
const geburtstagJob = require('../../jobs/cronJob_geburtstag');
const monthlyXPJob = require('../../jobs/cronJob_monthlyXP');
const newYearJob = require('../../jobs/cronJob_newYear');
const quizQuestionJob = require('../../jobs/cronJob_quizQuestion');
const quizStatsJob = require('../../jobs/cronJob_quizStats');
const renameLogFileJob = require('../../jobs/cronJob_renameLogFile');
const missingXpJob = require('../../jobs/cronJob_checkMissingXP');
const voiceJob = require('../../jobs/cronJob_voiceXp');
const zinsenJob = require('../../jobs/cronJob_zinsen');
const checkActiveItems = require('../../jobs/cronJob_checkActiveItems');
const checkVoiceChannels = require('../../jobs/cronJob_checkVoicechannels');
const Config = require('../../models/Config');
const {
  maintenanceActive,
  checkMaintenance,
} = require('../../utils/checkMaintenance');

async function checkVoice(client) {
  let isTwoMembers = false;
  await client.channels.cache.forEach(async (channel) => {
    if (channel.type == 2 && channel.id != '1307820687599337602') {
      if (channel.members.size >= 2) {
        isTwoMembers = true;
      }
    }
  });
  if (isTwoMembers) {
    if (!voiceJob.isRunning()) {
      voiceJob.startJob(client);
    }
  }
}

module.exports = {
  once: true,
  run: async (client) => {
    console.log(`Checking Maintenance...`);
    try {
      await checkMaintenance();
      if (maintenanceActive.size > 0) {
        console.log(`Maintenance is active for the following guilds:`);
        maintenanceActive.forEach((id) => {
          console.log(`- ${id}`);
        });
      } else {
        console.log(`Maintenance is not active.`);
      }
    } catch (error) {
      console.log(error);
    }
    console.log(`Starting Jobs...`);
    try {
      const jobsActive = await Config.findOne({ key: 'jobsActive' });
      if (jobsActive && jobsActive.value == 'J') {
        bumpReminderJob.startJob(client);
        checkBumperRoleJob.startJob(client);
        checkInactiveJob.startJob(client);
        customStatusJob.startJob(client);
        geburtstagJob.startJob(client);
        monthlyXPJob.startJob(client);
        newYearJob.startJob(client);
        quizQuestionJob.startJob(client);
        quizStatsJob.startJob(client);
        renameLogFileJob.startJob(client);
        missingXpJob.startJob(client);
        zinsenJob.startJob(client);
        checkActiveItems.startJob(client);
        checkVoiceChannels.startJob(client);
        checkVoice(client);
        console.log(`Jobs started.`);
      } else {
        console.log(`Jobstart deactivated.`);
      }
    } catch (error) {
      console.log(error);
    }
  },
};

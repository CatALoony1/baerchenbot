const bumpReminderJob = require('../../../jobs/cronJob_bumpReminder');
const checkBumperRoleJob = require('../../../jobs/cronJob_checkBumperRole');
const checkInactiveJob = require('../../../jobs/cronJob_checkInactive');
const customStatusJob = require('../../../jobs/cronJob_customStatus');
const geburtstagJob = require('../../../jobs/cronJob_geburtstag');
const monthlyXPJob = require('../../../jobs/cronJob_monthlyXP');
const newYearJob = require('../../../jobs/cronJob_newYear');
const quizQuestionJob = require('../../../jobs/cronJob_quizQuestion');
const quizStatsJob = require('../../../jobs/cronJob_quizStats');
const renameLogFileJob = require('../../../jobs/cronJob_renameLogFile');
const voiceXPJob = require('../../../jobs/cronJob_voiceXp');
const missingXpJob = require('../../../jobs/cronJob_checkMissingXP');
const checkNewAnimalsJob = require('../jobs/checkNewAnimals');
const zinsenJob = require('../../../jobs/cronJob_zinsen');
const checkActiveItemsJob = require('../../../jobs/cronJob_checkActiveItems');
const checkVoiceChannelsJob = require('../../../jobs/cronJob_checkVoicechannels');

async function doJobCommands(interaction, client) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const subcommand = interaction.options.getSubcommand();
    let job = null;
    let jobClass = null;
    if (subcommand !== 'job-stop-all') {
      job = interaction.options.get('job').value || null;
      switch (job) {
        case 'bumpReminder':
          jobClass = bumpReminderJob;
          break;
        case 'checkBumperRole':
          jobClass = checkBumperRoleJob;
          break;
        case 'checkInactive':
          jobClass = checkInactiveJob;
          break;
        case 'customStatus':
          jobClass = customStatusJob;
          break;
        case 'geburtstag':
          jobClass = geburtstagJob;
          break;
        case 'monthlyXP':
          jobClass = monthlyXPJob;
          break;
        case 'newYear':
          jobClass = newYearJob;
          break;
        case 'quizQuestion':
          jobClass = quizQuestionJob;
          break;
        case 'quizStats':
          jobClass = quizStatsJob;
          break;
        case 'renameLogFile':
          jobClass = renameLogFileJob;
          break;
        case 'voiceXP':
          jobClass = voiceXPJob;
          break;
        case 'missingXp':
          jobClass = missingXpJob;
          break;
        case 'checkNewAnimals':
          jobClass = checkNewAnimalsJob;
          break;
        case 'zinsen':
          jobClass = zinsenJob;
          break;
        case 'checkActiveItems':
          jobClass = checkActiveItemsJob;
          break;
        case 'checkVoiceChannels':
          jobClass = checkVoiceChannelsJob;
          break;
        default:
          throw new Error(`Unbekannter Job: ${job}`);
      }
    }
    if (subcommand === 'job-start') {
      if (!jobClass.isRunning()) {
        jobClass.startJob(client);
        await interaction.editReply({
          content: `Job ${job} wurde erfolgreich gestartet.`,
        });
      } else {
        await interaction.editReply({ content: `Job ${job} läuft bereits.` });
      }
    } else if (subcommand === 'job-stop') {
      if (jobClass.isRunning()) {
        jobClass.stopJob();
        await interaction.editReply({
          content: `Job ${job} wurde erfolgreich gestoppt.`,
        });
      } else {
        await interaction.editReply({ content: `Job ${job} läuft nicht.` });
      }
    } else if (subcommand === 'job-execute') {
      await jobClass.jobFunction(client);
      await interaction.editReply({
        content: `Job ${job} wurde erfolgreich ausgeführt.`,
      });
    } else if (subcommand === 'job-stop-all') {
      bumpReminderJob.stopJob();
      checkBumperRoleJob.stopJob();
      checkInactiveJob.stopJob();
      customStatusJob.stopJob();
      geburtstagJob.stopJob();
      monthlyXPJob.stopJob();
      newYearJob.stopJob();
      quizQuestionJob.stopJob();
      quizStatsJob.stopJob();
      renameLogFileJob.stopJob();
      voiceXPJob.stopJob();
      missingXpJob.stopJob();
      zinsenJob.stopJob();
      checkActiveItemsJob.stopJob();
      checkVoiceChannelsJob.stopJob();
      await interaction.editReply({
        content: `Alle Jobs wurden erfolgreich gestoppt.`,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = doJobCommands;

const express = require('express');
const router = express.Router();
const jobMap = {
  cronJob_bumpReminder: require('../../jobs/cronJob_bumpReminder'),
  cronJob_checkBumperRole: require('../../jobs/cronJob_checkBumperRole'),
  cronJob_checkInactive: require('../../jobs/cronJob_checkInactive'),
  cronJob_customStatus: require('../../jobs/cronJob_customStatus'),
  cronJob_geburtstag: require('../../jobs/cronJob_geburtstag'),
  cronJob_monthlyXP: require('../../jobs/cronJob_monthlyXP'),
  cronJob_newYear: require('../../jobs/cronJob_newYear'),
  cronJob_quizQuestion: require('../../jobs/cronJob_quizQuestion'),
  cronJob_quizStats: require('../../jobs/cronJob_quizStats'),
  cronJob_renameLogFile: require('../../jobs/cronJob_renameLogFile'),
  cronJob_voiceXp: require('../../jobs/cronJob_voiceXp'),
  cronJob_checkMissingXP: require('../../jobs/cronJob_checkMissingXP'),
  checkNewAnimals: require('../../jobs/checkNewAnimals'),
  cronJob_zinsen: require('../../jobs/cronJob_zinsen'),
  cronJob_checkActiveItems: require('../../jobs/cronJob_checkActiveItems'),
  cronJob_checkVoicechannels: require('../../jobs/cronJob_checkVoicechannels'),
};

router.get('/', (req, res) => {
  if (req.session.guildIds !== 'all') {
    req.session.message = 'Du bist dazu nicht berechtigt!';
    return res.redirect('/');
  }
  const alleJobs = Object.entries(jobMap).map(([jobname, modul]) => ({
    jobname: jobname,
    status: modul.isRunning(),
  }));
  res.render('jobs', {
    alleJobs: alleJobs,
    error: null,
  });
});

router.post('/start', (req, res) => {
  const client = req.discordClient;
  const { jobname } = req.body;
  jobMap[jobname].startJob(client);
  res.redirect('/jobs');
});

router.post('/stop', (req, res) => {
  const client = req.discordClient;
  const { jobname } = req.body;
  jobMap[jobname].stopJob(client);
  res.redirect('/jobs');
});

router.post('/execute', async (req, res) => {
  const client = req.discordClient;
  const { jobname } = req.body;
  await jobMap[jobname].jobFunction(client);
  res.redirect('/jobs');
});

router.post('/all', async (req, res) => {
  const client = req.discordClient;
  const { action } = req.body;
  if (action === 'start') {
    for (const [jobname, job] of Object.entries(jobMap)) {
      if (jobname !== 'checkNewAnimals') {
        job.startJob(client);
      }
    }
  } else {
    for (const [jobname, job] of Object.entries(jobMap)) {
      if (jobname !== 'checkNewAnimals') {
        job.stopJob(client);
      }
    }
  }
  res.redirect('/jobs');
});

module.exports = router;

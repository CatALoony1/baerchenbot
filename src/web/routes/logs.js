const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  if (req.session.guildIds !== 'all') {
    req.session.message = 'Du bist dazu nicht berechtigt!';
    return res.redirect('/');
  }
  const logsDir = path.join(__dirname, '../../../logs');
  let logFiles = [];
  if (fs.existsSync(logsDir)) {
    logFiles = fs
      .readdirSync(logsDir)
      .filter((file) => file.includes('bot._log'));
    logFiles.sort().reverse();
  }
  let selectedFile = req.query.file || 'bot._log';
  selectedFile = path.basename(selectedFile);
  if (!selectedFile.includes('bot._log')) {
    selectedFile = 'bot._log';
  }
  const targetLogPath = path.join(logsDir, selectedFile);
  let logData = 'Keine Log-Datei gefunden.';
  if (fs.existsSync(targetLogPath)) {
    try {
      logData = fs.readFileSync(targetLogPath, 'utf8');
    } catch (err) {
      logData = 'Fehler beim Lesen der Log-Datei.';
    }
  }
  res.render('logs', {
    logFiles: logFiles,
    selectedFile: selectedFile,
    logData: logData,
  });
});

module.exports = router;

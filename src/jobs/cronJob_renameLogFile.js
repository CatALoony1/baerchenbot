const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
let renameLogFileJob = null;
function deleteOldLogs() {
  const logDir = './logs';
  const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (!fs.existsSync(logDir)) return;
  fs.readdir(logDir, (err, files) => {
    if (err) {
      console.error('Fehler beim Lesen des Log-Verzeichnisses:', err);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(logDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Fehler beim Abrufen der Stats für ${file}:`, err);
          return;
        }
        if (now - stats.mtimeMs > tenDaysInMs) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Fehler beim Löschen von ${file}:`, err);
            } else {
              console.log(`Alte Log-Datei gelöscht: ${file}`);
            }
          });
        }
      });
    });
  });
}

function startJob(client) {
  if (renameLogFileJob) {
    console.log('RenameLogFile-Job is already running.');
    return;
  }
  renameLogFileJob = cron.schedule('58 23 * * *', async function () {
    console.log(`RenameLogFile-Job started...`);
    if (fs.existsSync('./logs/bot._log')) {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const newFilename = `./logs/bot._log_${d.getFullYear()}-${month}-${day}`;
      fs.rename('./logs/bot._log', newFilename, function (err) {
        if (err) throw err;
      });
    }
    deleteOldLogs();
    console.log(`RenameLogFile-Job finished`);
  });
  console.log('RenameLogFile-Job started.');
}

function stopJob() {
  if (renameLogFileJob) {
    renameLogFileJob.stop();
    renameLogFileJob = null;
    console.log('RenameLogFile-Job stopped.');
  } else {
    console.log('RenameLogFile-Job is not running.');
  }
}

function isRunning() {
  return renameLogFileJob !== null;
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


  getFullYear() 	Get year as a four digit number (yyyy)
getMonth() 	Get month as a number (0-11)
getDate() 	Get day as a number (1-31)
*/

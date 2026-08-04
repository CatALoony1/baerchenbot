require('dotenv').config();
const Tiere = require('../models/Tiere');
const fs = require('fs').promises;
const path = require('path');

const animalFoler = './animals';

function getTierart(filename) {
  const basename = path.basename(filename, '.webp');
  let tierart = basename.replace(/\d+$/, '');
  if (tierart.includes('-')) {
    tierart = tierart.split('-')[0];
  }
  return tierart;
}

async function jobFunction(client) {
  let localAnimals = [];
  try {
    const allLocalFiles = await fs.readdir(animalFoler);
    localAnimals = allLocalFiles.filter(
      (file) => path.extname(file).toLowerCase() === '.webp',
    );
    console.log(`Gefundene Tierbilder: ${localAnimals.length}`);
    const existingTierDokumente = await Tiere.find({}, 'pfad -_id').lean();
    const existingPfade = new Set(existingTierDokumente.map((doc) => doc.pfad));
    const newTiereToAdd = [];
    for (const filename of localAnimals) {
      const filenameWithoutExtension = path.basename(filename, '.webp');
      if (!existingPfade.has(filenameWithoutExtension)) {
        const tierart = getTierart(filename);
        let customName = filenameWithoutExtension;
        if (filenameWithoutExtension.includes('-')) {
          customName = filenameWithoutExtension.split('-')[1];
        }
        const newTier = {
          pfad: filenameWithoutExtension,
          tierart: tierart,
          customName: customName,
        };
        newTiereToAdd.push(newTier);
      }
    }
    if (newTiereToAdd.length > 0) {
      console.log(`Neue Tierbilder zum Hinzufügen: ${newTiereToAdd.length}`);
      const result = await Tiere.insertMany(newTiereToAdd, { ordered: false });
      console.log(`Erfolgreich hinzugefügt: ${result.length} neue Tierbilder.`);
    } else {
      console.log('Keine neuen Tierbilder zum Hinzufügen.');
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

function isRunning() {
  return false;
}

module.exports = {
  jobFunction,
  isRunning,
};

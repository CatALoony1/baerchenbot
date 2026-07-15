const Config = require('../models/Config');
const maintenanceActive = new Set();
async function checkMaintenance() {
  const maintenanceConfig = await Config.findOne({ key: 'maintenance' });
  if (maintenanceConfig && maintenanceConfig.value !== '') {
    maintenanceActive.clear();
    maintenanceConfig.value
      .split(',')
      .map((id) => id.trim())
      .forEach((id) => maintenanceActive.add(id));
  } else {
    maintenanceActive.clear();
  }
}
module.exports = { maintenanceActive, checkMaintenance };

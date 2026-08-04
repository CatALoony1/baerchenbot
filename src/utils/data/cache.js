const Config = require('../../models/Config');
const ServerConfig = require('../../models/ServerConfig');
const confCache = new Map();
const serverConfCache = new Map();

async function refreshConfCache(guildId) {
  try {
    const config = await Config.find({ guildId: guildId }).lean();
    const confMap = new Map();
    for (const conf of config) {
      confMap.set(conf.key, conf.value);
    }
    confCache.set(guildId, confMap);
  } catch (error) {
    console.log(error);
  }
}

async function refreshServerConfCache(guildId) {
  try {
    const config = await ServerConfig.find({ guildId: guildId }).lean();
    const confMap = new Map();
    for (const conf of config) {
      confMap.set(conf.variableName, conf.objectId);
    }
    serverConfCache.set(guildId, confMap);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  confCache,
  serverConfCache,
  refreshConfCache,
  refreshServerConfCache,
};

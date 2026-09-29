const { refreshConfCache, confCache } = require('../../utils/data/cache');
const Config = require('../../models/Config');

module.exports = {
  run: async (guild) => {
    console.log(`Available ${guild.id}`);
    await refreshConfCache(guild.id);
    if (!confCache.get(guild.id).get('CONFIGURED')) {
      const newConfig = new Config({
        key: 'CONFIGURED',
        value: 'N',
        guildId: guild.id,
      });
      await newConfig.save();
      await refreshConfCache(guild.id);
    }
  },
};

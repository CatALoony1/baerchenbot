const {
  refreshConfCache,
  refreshServerConfCache,
} = require('../../utils/data/cache');

module.exports = {
  once: true,
  run: async (client) => {
    console.log(`Loading cache...`);
    const guilds = await client.guilds.cache;
    await guilds.forEach(async (guild) => {
      console.log(`Loading cache for guild: ${guild.name} (ID: ${guild.id})`);
      await refreshConfCache(guild.id);
      await refreshServerConfCache(guild.id);
      console.log(`Cache loaded for guild: ${guild.name} (ID: ${guild.id})`);
    });
    console.log(`Cache loaded!`);
  },
};

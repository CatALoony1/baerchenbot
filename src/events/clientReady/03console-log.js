require('dotenv').config();
const { serverConfCache } = require('../../utils/data/cache');
module.exports = {
  once: true,

  run: async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
      let targetUser = undefined;
      let targetChannels = [];
      let counter = -1;
      const guilds = await client.guilds.cache;
      let message = `Bot ist gestartet.\nDer Bot ist laut API auf ${guilds.size} Server(n):\n`;
      guilds.forEach((guild) => {
        if (!targetUser) {
          targetUser = guild.members.cache.get(process.env.ADMIN_ID);
        }
        if (
          targetChannels.length != counter &&
          serverConfCache.get(guild.id) &&
          serverConfCache.get(guild.id).get('LOG_ID')
        ) {
          targetChannels.push(
            guild.channels.cache.get(
              serverConfCache.get(guild.id).get('LOG_ID'),
            ),
          );
          if (counter == -1) {
            counter = 1;
          } else {
            counter++;
          }
        }
        message = `${message}- ${guild.name} (ID: ${guild.id})`;
      });
      if (targetUser) {
        await targetUser.send(message);
      }
      for (const targetChannel of targetChannels) {
        await targetChannel.send(message);
      }
    } catch (error) {
      console.log(error);
    }
  },
};

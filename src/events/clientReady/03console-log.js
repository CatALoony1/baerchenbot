require('dotenv').config();
module.exports = {
  once: true,

  run: async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
      let targetUser = undefined;
      let targetChannel = undefined;
      const guilds = await client.guilds.cache;
      let message = `Bot ist gestartet.\nDer Bot ist laut API auf ${guilds.size} Server(n):\n`;
      await guilds.forEach(async (guild) => {
        if (!targetUser) {
          targetUser = await guild.members.fetch(process.env.ADMIN_ID);
        }
        if (!targetChannel) {
          targetChannel =
            guild.channels.cache.get('1527947035804696678') ||
            (await guild.channels.fetch('1527947035804696678'));
        }
        message = `${message}- ${guild.name} (ID: ${guild.id})`;
      });
      if (targetUser) {
        await targetUser.send(message);
      }
      if (targetChannel) {
        await targetChannel.send(message);
      }
    } catch (error) {
      console.log(error);
    }
  },
};

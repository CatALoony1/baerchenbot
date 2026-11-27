require('dotenv').config();
const { serverConfCache } = require('../../utils/data/cache');
module.exports = {
  once: true,

  run: async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
      let targetUser = undefined;
      let targetChannels = [];
      const guilds = await client.guilds.cache;
      let message = `Bot ist gestartet.\nDer Bot ist laut API auf ${guilds.size} Server(n):\n`;
      await guilds.forEach(async (guild) => {
        if (!targetUser) {
          targetUser = guild.members.cache.get(process.env.ADMIN_ID);
        }
        const config = await waitForDefined(
          () => serverConfCache.get(guild.id),
          {
            timeoutMs: 4000,
            intervalMs: 50,
          },
        );
        const logId = await waitForDefined(() => config.get('LOG_ID'), {
          timeoutMs: 4000,
          intervalMs: 50,
        });
        if (logId) {
          console.log(
            guild.channels.cache.get(
              serverConfCache.get(guild.id).get('LOG_ID'),
            ),
          );
          targetChannels.push(
            guild.channels.cache.get(
              serverConfCache.get(guild.id).get('LOG_ID'),
            ),
          );
        }
        message = `${message}- ${guild.name} (ID: ${guild.id})\n`;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDefined(
  getValue,
  { timeoutMs = 3000, intervalMs = 50 } = {},
) {
  const deadline = Date.now() + timeoutMs;

  while (true) {
    const value = getValue();
    if (value !== undefined) {
      return value;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new Error(
        `Timed out after ${timeoutMs}ms waiting for value to be defined`,
      );
    }

    await sleep(Math.min(intervalMs, remaining));
  }
}

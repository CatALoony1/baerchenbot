require('dotenv').config();
const { serverConfCache } = require('../../utils/data/cache');
module.exports = {
  once: true,

  run: async (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
    let message = `Bot ist gestartet.\nDer Bot ist laut API auf ${client.guilds.cache.size} Server(n):\n`;
    const targetChannels = [];
    for (const guild of client.guilds.cache.values()) {
      let logId = null;
      try {
        const config = await waitForDefined(
          () => serverConfCache.get(guild.id),
          { timeoutMs: 4000, intervalMs: 50 },
        );
        if (config) {
          logId = await waitForDefined(() => config.get('LOG_ID'), {
            timeoutMs: 4000,
            intervalMs: 50,
          });
        }
      } catch (err) {
        console.error(`Config lookup failed for guild ${guild.id}:`, err);
      }
      if (logId) {
        const channel = guild.channels.cache.get(logId);
        if (channel?.isTextBased()) {
          targetChannels.push(channel);
        }
      }
      message += `- ${guild.name} (ID: ${guild.id})\n`;
    }
    if (process.env.ADMIN_ID) {
      try {
        const targetUser = await client.users.fetch(process.env.ADMIN_ID);
        await targetUser.send(message);
      } catch (err) {
        console.error('Failed to send startup DM to admin:', err);
      }
    }
    for (const targetChannel of targetChannels) {
      try {
        await targetChannel.send(message);
      } catch (err) {
        console.error(
          `Failed to send startup message to channel ${targetChannel.id}:`,
          err,
        );
      }
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

const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = req.discordClient;
    let servers = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
    }));
    const allowedGuilds = req.session.guildIds;
    if (allowedGuilds !== 'all') {
      const allowedIds = allowedGuilds.split(',').map((id) => id.trim());
      servers = servers.filter((server) => allowedIds.includes(server.id));
    }
    const selectedServerId = req.query.serverId || servers[0]?.id;
    if (selectedServerId) {
      const selectedGuild = client.guilds.cache.get(selectedServerId);
      if (selectedGuild) {
        //
      }
    }
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: servers,
      selectedServerId: selectedServerId,
      lvlsys: lvlsys,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      error: error.message,
      lvlsys: lvlsys,
    });
  }
});

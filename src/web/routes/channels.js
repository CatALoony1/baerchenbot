const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
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
  const selectedServerId = req.query.serverId;
  let channels = [];

  if (selectedServerId) {
    const selectedGuild = client.guilds.cache.get(selectedServerId);
    if (selectedGuild) {
      channels = selectedGuild.channels.cache.map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
      }));
    }
  }
  res.render('channels', {
    servers: servers,
    selectedServerId: selectedServerId,
    channels: channels,
  });
});

module.exports = router;

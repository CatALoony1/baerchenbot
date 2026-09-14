const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const client = req.discordClient;
  let servers = client.guilds.cache.map((guild) => ({
    id: guild.id,
    name: guild.name,
  }));
  let rollen = [];
  const selectedServerId = req.query.serverId || servers[0]?.id;
  const allowedGuilds = req.session.guildIds;
  if (allowedGuilds !== 'all') {
    const allowedIds = allowedGuilds.split(',').map((id) => id.trim());
    servers = servers.filter((server) => allowedIds.includes(server.id));
  }
  if (selectedServerId) {
    const selectedGuild = client.guilds.cache.get(selectedServerId);
    if (selectedGuild) {
      rollen = selectedGuild.roles.cache.map((role) => ({
        id: role.id,
        name: role.name,
      }));
    }
  }
  return res.render('role-select', {
    guildIds: allowedGuilds,
    selectedServerId: selectedServerId,
    servers: servers,
    allSelNames: [],
    rollen: rollen,
  });
});

module.exports = router;

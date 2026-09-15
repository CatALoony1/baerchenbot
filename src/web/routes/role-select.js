const express = require('express');
const router = express.Router();
const RoleSelectionRoles = require('../../models/RoleSelectionRoles');

router.get('/', async (req, res) => {
  try {
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
    const allSelNames = [];
    const allSelMenObj = new Set();
    if (selectedServerId) {
      const allSelMenus = await RoleSelectionRoles.find({
        guildId: selectedServerId,
      });
      const selectedGuild = client.guilds.cache.get(selectedServerId);
      const roleMap = new Map();
      if (selectedGuild) {
        rollen = selectedGuild.roles.cache.map((role) => ({
          id: role.id,
          name: role.name,
        }));
        selectedGuild.roles.cache.forEach((role) => {
          roleMap.set(role.id, role.name);
        });
      }
      allSelMenus.forEach((menu) => {
        allSelNames.push(menu.selectMenu);
        let selMenuObj = {
          name: menu.selectMenu,
          description: menu.selectDescription,
          roleNames: [],
        };
        menu.roleIds.forEach((roleId) => {
          if (roleMap.has(roleId)) {
            selMenuObj.roleNames.push(roleMap.get(roleId));
          }
        });
        allSelMenObj.add(selMenuObj);
      });
    }
    return res.render('role-select', {
      guildIds: allowedGuilds,
      selectedServerId: selectedServerId,
      servers: servers,
      allSelNames: allSelNames,
      rollen: rollen,
      allSelMenObj: allSelMenObj,
    });
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
});

router.post('/add', async (req, res) => {
  try {
    const { selName, selDesc, roles } = req.body;
    const selectedServerId = req.body.serverId;
    if (
      !selectedServerId ||
      !selName ||
      !selDesc ||
      !roles ||
      roles.length < 2
    ) {
      return res.redirect(`/role-select?serverId=${selectedServerId}`);
    }
    const existingRoleSelection = await RoleSelectionRoles.findOne({
      guildId: selectedServerId,
      selectMenu: selName,
    });
    if (existingRoleSelection) {
      return res.redirect(`/role-select?serverId=${selectedServerId}`);
    }
    const newRoleSelection = new RoleSelectionRoles({
      guildId: selectedServerId,
      roleIds: roles,
      selectMenu: selName,
      selectDescription: selDesc,
    });
    await newRoleSelection.save();
    return res.redirect(`/role-select?serverId=${selectedServerId}`);
  } catch (error) {
    console.log(error);
    return res.redirect(`/role-select?serverId=${req.query.serverId}`);
  }
});

router.post('/send', async (req, res) => {
  try {
    // TODO
    return res.redirect(`/role-select?serverId=${req.query.serverId}`);
  } catch (error) {
    console.log(error);
    return res.redirect(`/role-select?serverId=${req.query.serverId}`);
  }
});

router.post('/update', async (req, res) => {
  try {
    // TODO
    return res.redirect(`/role-select?serverId=${req.query.serverId}`);
  } catch (error) {
    console.log(error);
    return res.redirect(`/role-select?serverId=${req.query.serverId}`);
  }
});

module.exports = router;

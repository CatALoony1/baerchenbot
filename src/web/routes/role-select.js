const express = require('express');
const router = express.Router();
const RoleSelectionRoles = require('../../models/RoleSelectionRoles');
const { serverConfCache } = require('../../utils/data/cache');
const printSelectMenu = require('../../utils/webFunctions/printSelectMenu');

router.get('/', async (req, res) => {
  let infoText = null;
  try {
    const client = req.discordClient;
    let servers = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
    }));
    const info = req.query.info;
    if (info) {
      switch (info) {
        case '1':
          infoText = 'Die Nachricht des SelectMenus wurde in Discord gelöscht.';
          break;
        case '2':
          infoText = 'Die Nachricht des SelectMenus wurde in Discord editiert.';
          break;
        case '3':
          infoText = 'Die Nachricht des SelectMenus wurde in Discord gesendet.';
          break;
        case '4':
          infoText = 'Das SelectMenu wurde in der Datenbank geupdatet.';
          break;
        case '5':
          infoText =
            'Das SelectMenu wurde in der Datenbank und auf Discord geupdatet.';
          break;
      }
    }
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
          multiSelect: menu.multiSelect,
          roleIds: menu.roleIds,
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
      error: null,
      info: 0,
      infoText: infoText,
    });
  } catch (error) {
    console.log(error);
    return res.render('role-select', renderErrorTemplate(req, error.message));
  }
});

router.post('/add', async (req, res) => {
  try {
    const { selName, selDesc, roles } = req.body;
    const isMulti = Boolean(req.body.selMulti);
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
      selectMenu: selName.trim(),
    });
    if (existingRoleSelection) {
      return res.redirect(`/role-select?serverId=${selectedServerId}`);
    }
    const newRoleSelection = new RoleSelectionRoles({
      guildId: selectedServerId,
      roleIds: roles,
      selectMenu: selName.trim(),
      selectDescription: selDesc,
      multiSelect: isMulti,
    });
    await newRoleSelection.save();
    return res.redirect(`/role-select?serverId=${selectedServerId}`);
  } catch (error) {
    console.log(error);
    return res.render('role-select', renderErrorTemplate(req, error.message));
  }
});

router.post('/send', async (req, res) => {
  let info = 0;
  try {
    const { serverId, selMenName } = req.body;
    const client = req.discordClient;
    const guild = client.guilds.cache.get(serverId);
    if (!serverConfCache.get(serverId).get('SELFROLES_ID')) {
      return res.render(
        'role-select',
        renderErrorTemplate(
          req,
          'Bitte zuerst den Selfroles Channel konfigurieren',
        ),
      );
    }
    const targetChannel =
      guild.channels.cache.get(
        serverConfCache.get(serverId).get('SELFROLES_ID'),
      ) ||
      (await guild.channels.fetch(
        serverConfCache.get(serverId).get('SELFROLES_ID'),
      ));
    const selMenu = await RoleSelectionRoles.findOne({
      guildId: serverId,
      selectMenu: selMenName,
    });
    if (!selMenu) {
      return res.render(
        'role-select',
        renderErrorTemplate(
          req,
          'Unerwarteter Fehler: SelMenu konnte nicht in DB gefunden werden',
        ),
      );
    }
    const messageContent = await printSelectMenu(selMenu, guild);
    if (!messageContent) {
      return res.render(
        'role-select',
        renderErrorTemplate(
          req,
          'Unerwarteter Fehler: SelMenu Content konnte nicht erstellt werden',
        ),
      );
    }
    if (selMenu.messageId) {
      const targetMessage = await targetChannel.messages.fetch(
        selMenu.messageId,
      );
      await targetMessage.edit(messageContent);
      info = 2;
    } else {
      const message = await targetChannel.send(messageContent);
      selMenu.messageId = message.id;
      await selMenu.save();
      info = 3;
    }
    return res.redirect(`/role-select?serverId=${serverId}&info=${info}`);
  } catch (error) {
    console.log(error);
    return res.render('role-select', renderErrorTemplate(req, error.message));
  }
});

router.post('/update', async (req, res) => {
  let info = 0;
  try {
    const { serverId, selMenName, selDesc, roles } = req.body;
    const selMenu = await RoleSelectionRoles.findOne({
      guildId: serverId,
      selectMenu: selMenName,
    });
    if (!selMenu) {
      return res.render(
        'role-select',
        renderErrorTemplate(
          req,
          'Unerwarteter Fehler: SelMenu konnte nicht in DB gefunden werden',
        ),
      );
    }
    const messageId = selMenu.messageId;
    selMenu.selectDescription = selDesc;
    selMenu.roleIds = roles;
    selMenu.save();
    info = 4;
    if (messageId) {
      if (serverConfCache.get(serverId).get('SELFROLES_ID')) {
        const targetChannel =
          guild.channels.cache.get(
            serverConfCache.get(serverId).get('SELFROLES_ID'),
          ) ||
          (await guild.channels.fetch(
            serverConfCache.get(serverId).get('SELFROLES_ID'),
          ));
        if (targetChannel) {
          const targetMessage = await targetChannel.messages.fetch(
            selMenu.messageId,
          );
          if (targetMessage) {
            await targetMessage.delete();
            info = 5;
          }
        }
      }
    }
    return res.redirect(
      `/role-select?serverId=${req.query.serverId}&info=${info}`,
    );
  } catch (error) {
    console.log(error);
    return res.render('role-select', renderErrorTemplate(req, error.message));
  }
});

router.post('/delete', async (req, res) => {
  try {
    let info = 0;
    const { serverId, selMenName } = req.body;
    const selMenu = await RoleSelectionRoles.findOne({
      guildId: serverId,
      selectMenu: selMenName,
    });
    if (!selMenu) {
      return res.render(
        'role-select',
        renderErrorTemplate(
          req,
          'Unerwarteter Fehler: SelMenu konnte nicht in DB gefunden werden',
        ),
      );
    }
    await selMenu.deleteOne();
    if (selMenu.messageId) {
      const client = req.discordClient;
      const guild = client.guilds.cache.get(serverId);
      if (serverConfCache.get(serverId).get('SELFROLES_ID')) {
        const targetChannel =
          guild.channels.cache.get(
            serverConfCache.get(serverId).get('SELFROLES_ID'),
          ) ||
          (await guild.channels.fetch(
            serverConfCache.get(serverId).get('SELFROLES_ID'),
          ));
        if (targetChannel) {
          const targetMessage = await targetChannel.messages.fetch(
            selMenu.messageId,
          );
          if (targetMessage) {
            await targetMessage.delete();
            info = 1;
          }
        }
      }
    }
    return res.redirect(`/role-select?serverId=${serverId}&info=${info}`);
  } catch (error) {
    console.log(error);
    return res.render('role-select', renderErrorTemplate(req, error.message));
  }
});

function renderErrorTemplate(req, message) {
  return {
    guildIds: req.session.guildIds,
    selectedServerId: null,
    servers: [],
    allSelNames: [],
    rollen: [],
    allSelMenObj: new Set(),
    error: message,
    info: 0,
    infoText: null,
  };
}

module.exports = router;

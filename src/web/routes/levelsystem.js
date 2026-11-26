const express = require('express');
const router = express.Router();
const Config = require('../../models/Config');
const { refreshConfCache } = require('../../utils/data/cache');

router.get('/', async (req, res) => {
  try {
    const client = req.discordClient;
    let servers = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
    }));
    const lvlsys = {
      lvlUpTxt: '',
      lvlUpTxtRole: '',
      xpMessage: 0,
      xpVoice: 0,
      lvlSys: false,
      xpLvlUp: 1,
      lvlRole: 5,
      lvlRoles: false,
      numNamePrefix: '',
      customRoleNames: '',
    };
    const allowedGuilds = req.session.guildIds;
    if (allowedGuilds !== 'all') {
      const allowedIds = allowedGuilds.split(',').map((id) => id.trim());
      servers = servers.filter((server) => allowedIds.includes(server.id));
    }
    if (!req.session.selGuild && !req.query.serverId) {
      req.session.selGuild = servers[0]?.id;
    } else if (
      req.query.serverId &&
      req.session.selGuild != req.query.serverId
    ) {
      req.session.selGuild = req.query.serverId;
    }
    const selectedServerId = req.session.selGuild;
    if (selectedServerId) {
      const selectedGuild = client.guilds.cache.get(selectedServerId);
      if (selectedGuild) {
        const lvlConf = await Config.find({
          guildId: selectedServerId,
          key: { $regex: '^LVL' },
        });
        if (lvlConf.length > 0) {
          const config = Object.fromEntries(
            lvlConf.map((conf) => [conf.key, conf.value]),
          );
          lvlsys.lvlUpTxt = config.LVL_UP_TEXT ?? '';
          lvlsys.lvlUpTxtRole = config.LVL_UP_TEXT_ROLE ?? '';
          lvlsys.xpMessage = Number(config.LVL_XP_MSG ?? '0');
          lvlsys.xpVoice = Number(config.LVL_XP_VC ?? '0');
          lvlsys.lvlSys = (config.LVL_SYS ?? 'N') == 'J';
          lvlsys.xpLvlUp = Number(config.LVL_XP_LVLUP ?? '1');
          lvlsys.lvlRole = Number(config.LVL_ROLE ?? '5');
          lvlsys.lvlRoles = (config.LVL_ROLES ?? 'N') == 'J';
          lvlsys.numNamePrefix = config.LVL_NUM_NAME ?? '';
          lvlsys.customRoleNames = config.LVL_CUS_NAME ?? '';
        }
      }
    }
    return res.render('levelsystem', {
      guildIds: req.session.guildIds,
      servers: servers,
      selectedServerId: selectedServerId,
      lvlsys: lvlsys,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.render('levelsystem', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      error: error.message,
      lvlsys: {
        lvlUpTxt: '',
        lvlUpTxtRole: '',
        xpMessage: 0,
        xpVoice: 0,
        lvlSys: false,
        xpLvlUp: 1,
        lvlRole: 5,
        lvlRoles: false,
        numNamePrefix: '',
        customRoleNames: '',
      },
    });
  }
});

router.post('/save', async (req, res) => {
  try {
    const {
      text,
      textRole,
      xpMessage,
      xpVoice,
      lvlSys,
      xpLvlUp,
      lvlRole,
      lvlRoles,
      roleName,
      guildId,
    } = req.body;
    console.log(
      `/save call with guildId: ${guildId}, text: ${text}, xpMessage: ${xpMessage}, xpVoice: ${xpVoice}, lvlSys: ${lvlSys}, xpLvlUp: ${xpLvlUp}, lvlRole: ${lvlRole}, lvlRoles: ${lvlRoles}, roleName: ${roleName}`,
    );
    if (lvlRoles == 'customName' && roleName.split(',').length <= 1) {
      throw new Error(
        'Bitte mindestens zwei Rollen eingeben, durch Komma getrennt.',
      );
    }
    const bulkObj = [
      { key: 'LVL_UP_TEXT', value: text },
      { key: 'LVL_UP_TEXT_ROLE', value: textRole },
      { key: 'LVL_XP_MSG', value: xpMessage },
      { key: 'LVL_XP_VC', value: xpVoice },
      { key: 'LVL_SYS', value: lvlSys == 'gleichbleibend' ? 'J' : 'N' },
      { key: 'LVL_XP_LVLUP', value: xpLvlUp },
      { key: 'LVL_ROLE', value: lvlRole },
      { key: 'LVL_ROLES', value: lvlRoles == 'customName' ? 'J' : 'N' },
      { key: 'LVL_CUS_NAME', value: lvlRoles == 'customName' ? roleName : '' },
      { key: 'LVL_NUM_NAME', value: lvlRoles != 'customName' ? roleName : '' },
    ];
    const bulkOps = bulkObj.map((config) => ({
      updateOne: {
        filter: { guildId: guildId, key: config.key },
        update: { $set: { value: config.value } },
        upsert: true,
      },
    }));
    await Config.bulkWrite(bulkOps);
    await refreshConfCache(guildId);
    const targetUrl = guildId
      ? `/levelsystem?serverId=${guildId}`
      : '/levelsystem';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    y;
    return res.render('levelsystem', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      error: error.message,
      lvlsys: {
        lvlUpTxt: '',
        xpMessage: 0,
        xpVoice: 0,
        lvlSys: false,
        xpLvlUp: 1,
        lvlRole: 5,
        lvlRoles: false,
        numNamePrefix: '',
        customRoleNames: '',
      },
    });
  }
});

module.exports = router;

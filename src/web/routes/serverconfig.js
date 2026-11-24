const express = require('express');
require('dotenv').config();
const router = express.Router();
const ServerConfig = require('../../models/ServerConfig');
const idUses = require('../../utils/data/idUses');
const Config = require('../../models/Config');
const {
  refreshServerConfCache,
  refreshConfCache,
} = require('../../utils/data/cache');
const sendRuleSecretButton = require('../../utils/webFunctions/sendRuleSecretButton');

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
    let rollen = [];
    let defaultRole = [];
    let gifTextList = new Map();
    let ruleSecret = '';
    const inactive = {
      inacton: false,
      inacttime: 0,
      lurkon: false,
      lurktime: 0,
      deleteon: false,
      deletetime: 0,
    };
    const selectedServerId = req.query.serverId || servers[0]?.id;
    if (selectedServerId) {
      const selectedGuild = client.guilds.cache.get(selectedServerId);
      if (selectedGuild) {
        rollen = selectedGuild.roles.cache.map((role) => ({
          id: role.id,
          name: role.name,
        }));
        const srvCfg = await ServerConfig.find({
          guildId: selectedServerId,
        }).lean();
        for (const confi of srvCfg) {
          if (confi.variableName == 'MITGLIED_ROLE_ID') {
            defaultRole[0] = confi.objectId;
          } else if (confi.variableName == 'NEWMEMBER_ROLE_ID') {
            defaultRole[1] = confi.objectId;
          } else if (confi.variableName == 'MIDMEMBER_ROLE_ID') {
            defaultRole[2] = confi.objectId;
          } else if (confi.variableName == 'BOOSTER_ROLE_ID') {
            defaultRole[3] = confi.objectId;
          }
        }
        const cfg = await Config.find({
          guildId: selectedServerId,
        });
        for (const { key, value } of cfg) {
          const [type, kind] = key.split('_');
          if (kind === 'GIF' || kind === 'TXT' || kind === 'HEADER') {
            gifTextList = addToList(type, value, gifTextList, kind);
          } else if (key === 'RULE_SECRET') {
            ruleSecret = value;
          } else if (key == 'INACTIVE_ON') {
            inactive.inacton = value === 'J';
          } else if (key == 'INACTIVE_LURK_ON') {
            inactive.lurkon = value === 'J';
          } else if (key == 'INACTIVE_DEL_ON') {
            inactive.deleteon = value === 'J';
          } else if (key == 'INACTIVE_TIME') {
            inactive.inacttime = Number(value);
          } else if (key == 'INACTIVE_LURK_TIME') {
            inactive.lurktime = Number(value);
          } else if (key == 'INACTIVE_DEL_TIME') {
            inactive.deletetime = Number(value);
          }
        }
      }
    }
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: servers,
      selectedServerId: selectedServerId,
      alleRollen: rollen,
      defaultRole: defaultRole,
      uses: idUses,
      error: null,
      giphyApiKey: process.env.GIPHY_API,
      gifTextList: gifTextList,
      ruleSecret: ruleSecret,
      inactive: inactive,
    });
  } catch (error) {
    console.log(error);
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      alleRollen: [],
      defaultRole: '',
      uses: idUses,
      error: error.message,
      giphyApiKey: process.env.GIPHY_API,
      gifTextList: new Map(),
      ruleSecret: '',
      inactive: {
        inacton: false,
        inacttime: 0,
        lurkon: false,
        lurktime: 0,
        deleteon: false,
        deletetime: 0,
      },
    });
  }
});

router.post('/change-member-role', async (req, res) => {
  try {
    const guildId = req.body.guildId;
    const variableName = req.body.variableName;
    let roleId = req.body.newMemberRole;
    const targetUrl = guildId
      ? `/serverconfig?serverId=${guildId}`
      : '/serverconfig';
    const srvConf = await ServerConfig.findOne({
      guildId: guildId,
      variableName: variableName,
    });
    if (srvConf && srvConf.objectId != roleId) {
      srvConf.objectId = roleId;
      await srvConf.save();
    } else {
      const newSrvConf = new ServerConfig({
        guildId: guildId,
        variableName: variableName,
        objectId: roleId,
      });
      await newSrvConf.save();
    }
    console.log(
      `ServerConfig updated for guild ${guildId}: ${variableName} set to ${roleId}`,
    );
    await refreshServerConfCache(guildId);
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      alleRollen: [],
      defaultRole: '',
      uses: idUses,
      error: error.message,
      giphyApiKey: process.env.GIPHY_API,
      gifTextList: new Map(),
      ruleSecret: '',
      inactive: {
        inacton: false,
        inacttime: 0,
        lurkon: false,
        lurktime: 0,
        deleteon: false,
        deletetime: 0,
      },
    });
  }
});

router.post('/message', async (req, res) => {
  try {
    const { giphyId, text, header, guildId, messageType } = req.body;
    console.log(`Adding message for guild ${guildId}: ${messageType}`);
    await addToDb(giphyId, text.trim(), header.trim(), guildId, messageType);
    const targetUrl = guildId
      ? `/serverconfig?serverId=${guildId}`
      : '/serverconfig';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      alleRollen: [],
      defaultRole: '',
      uses: idUses,
      error: error.message,
      giphyApiKey: process.env.GIPHY_API,
      gifTextList: new Map(),
      ruleSecret: '',
      inactive: {
        inacton: false,
        inacttime: 0,
        lurkon: false,
        lurktime: 0,
        deleteon: false,
        deletetime: 0,
      },
    });
  }
});

router.post('/inactivity', async (req, res) => {
  try {
    const {
      inactactive,
      inacttime,
      lurkactive,
      lurktime,
      deleteactive,
      deletetime,
      guildId,
    } = req.body;
    console.log(`Adding interactivity setup for guild ${guildId}`);
    const entries = [
      { key: 'INACTIVE_ON', value: inactactive },
      { key: 'INACTIVE_LURK_ON', value: lurkactive },
      { key: 'INACTIVE_DEL_ON', value: deleteactive },
      { key: 'INACTIVE_TIME', value: inacttime },
      { key: 'INACTIVE_LURK_TIME', value: lurktime },
      { key: 'INACTIVE_DEL_TIME', value: deletetime },
    ];
    const operations = entries
      .filter(({ value }) => value !== undefined)
      .map(({ key, value }) => ({
        updateOne: {
          filter: { guildId, key },
          update: {
            $set: {
              value: value === null ? null : String(value),
            },
          },
          upsert: true,
        },
      }));
    if (operations.length > 0) {
      await Config.bulkWrite(operations);
    }
    await refreshConfCache(guildId);
    const targetUrl = guildId
      ? `/serverconfig?serverId=${guildId}`
      : '/serverconfig';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      alleRollen: [],
      defaultRole: '',
      uses: idUses,
      error: error.message,
      giphyApiKey: process.env.GIPHY_API,
      gifTextList: new Map(),
      ruleSecret: '',
      inactive: {
        inacton: false,
        inacttime: 0,
        lurkon: false,
        lurktime: 0,
        deleteon: false,
        deletetime: 0,
      },
    });
  }
});

router.post('/set-rule-secret', async (req, res) => {
  try {
    const { ruleSecret, guildId } = req.body;
    console.log(`Setting rule secret ${ruleSecret} for guild ${guildId}`);
    const cfg = await Config.findOne({
      guildId: guildId,
      key: 'RULE_SECRET',
    });
    if (cfg) {
      cfg.value = ruleSecret;
      await cfg.save();
    } else {
      const newCfg = new Config({
        guildId: guildId,
        key: 'RULE_SECRET',
        value: ruleSecret,
      });
      await newCfg.save();
    }
    const serverConf = await ServerConfig.findOne({
      guildId: guildId,
      variableName: 'REGELN_ID',
    });
    if (serverConf && serverConf.objectId.length > 10) {
      await sendRuleSecretButton(
        serverConf.objectId,
        req.discordClient,
        guildId,
      );
    }
    await refreshConfCache(guildId);
    const targetUrl = guildId
      ? `/serverconfig?serverId=${guildId}`
      : '/serverconfig';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('serverconfig', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      alleRollen: [],
      defaultRole: '',
      uses: idUses,
      error: error.message,
      giphyApiKey: process.env.GIPHY_API,
      gifTextList: new Map(),
      ruleSecret: '',
      inactive: {
        inacton: false,
        inacttime: 0,
        lurkon: false,
        lurktime: 0,
        deleteon: false,
        deletetime: 0,
      },
    });
  }
});

async function addToDb(giphyId, text, header, guildId, identifier) {
  const gifId = giphyId || '';
  const txt = text || '';
  const cfg = await Config.find({
    guildId: guildId,
    key: { $regex: `^${identifier}` },
  });
  let txtAdded = false;
  let gifAdded = false;
  let headerAdded = false;
  if (cfg) {
    for (const conf of cfg) {
      if (conf.key === `${identifier}_TXT`) {
        conf.value = txt;
        await conf.save();
        txtAdded = true;
      } else if (conf.key === `${identifier}_GIF`) {
        conf.value = gifId;
        await conf.save();
        gifAdded = true;
      } else if (conf.key === `${identifier}_HEADER`) {
        conf.value = header;
        await conf.save();
        headerAdded = true;
      }
    }
  }
  if (!gifAdded) {
    const newGifCfg = new Config({
      guildId: guildId,
      key: `${identifier}_GIF`,
      value: gifId,
    });
    await newGifCfg.save();
  }
  if (!txtAdded) {
    const newTxtCfg = new Config({
      guildId: guildId,
      key: `${identifier}_TXT`,
      value: txt,
    });
    await newTxtCfg.save();
  }
  if (!headerAdded) {
    const newHeaderCfg = new Config({
      guildId: guildId,
      key: `${identifier}_HEADER`,
      value: header,
    });
    await newHeaderCfg.save();
  }
  await refreshConfCache(guildId);
}

function addToList(identifier, content, map, kind) {
  const entry = map.get(identifier);
  if (entry) {
    if (kind === 'TXT') {
      entry.text = content;
    } else if (kind === 'GIF') {
      entry.gif = content;
    } else if (kind === 'HEADER') {
      entry.header = content;
    }
    map.set(identifier, entry);
  } else {
    if (kind === 'TXT') {
      map.set(identifier, { text: content, gif: '', header: '' });
    } else if (kind === 'HEADER') {
      map.set(identifier, { text: '', gif: '', header: content });
    } else {
      map.set(identifier, { text: '', gif: content, header: '' });
    }
  }
  return map;
}
module.exports = router;

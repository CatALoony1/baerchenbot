const express = require('express');
const router = express.Router();
const ServerConfig = require('../../models/ServerConfig');
const idUses = require('../../utils/data/idUses');
const { ChannelType } = require('discord.js');
const { refreshServerConfCache } = require('../../utils/data/cache');

const channelTypeMapping = {
  allgemein: 'ALLGEMEIN_ID',
  selfroles: 'SELFROLES_ID',
  bye: 'BYE_ID',
  log: 'LOG_ID',
  bump: 'BUMP_ID',
  quiz: 'QUIZ_ID',
  admin: 'ADMIN_C_ID',
  spiele: 'SPIELE_ID',
  vccreation: 'VCCREATION_ID',
  afk: 'AFK_ID',
};
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
    let textChannels = [];
    let voiceChannels = [];
    let defaultValues = {};
    const selectedServerId = req.query.serverId || servers[0]?.id;
    if (selectedServerId) {
      const selectedGuild = client.guilds.cache.get(selectedServerId);
      if (selectedGuild) {
        textChannels = selectedGuild.channels.cache
          .filter(
            (channel) =>
              channel.type === ChannelType.GuildText ||
              channel.type === ChannelType.GuildAnnouncement,
          )
          .map((channel) => ({
            id: channel.id,
            name: channel.name,
          }));
        voiceChannels = selectedGuild.channels.cache
          .filter(
            (channel) =>
              channel.type === ChannelType.GuildVoice ||
              channel.type === ChannelType.GuildStageVoice,
          )
          .map((channel) => ({
            id: channel.id,
            name: channel.name,
          }));
        const srvCfg = await ServerConfig.find({
          guildId: selectedServerId,
        }).lean();
        if (srvCfg) {
          defaultValues = srvCfg.reduce((acc, item) => {
            acc[item.variableName] = item.objectId;
            return acc;
          }, {});
        }
      }
    }
    return res.render('channelselection', {
      guildIds: req.session.guildIds,
      servers: servers,
      selectedServerId: selectedServerId,
      alleTextChannels: textChannels,
      alleVoiceChannels: voiceChannels,
      defaultValues: defaultValues,
      uses: idUses,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.render('channelselection', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      alleTextChannels: [],
      alleVoiceChannels: [],
      defaultValues: {},
      uses: idUses,
      error: error.message,
    });
  }
});

router.post('/change-channel-:chosenobj', async (req, res) => {
  try {
    const chosenObj = req.params.chosenobj;
    const searchString = channelTypeMapping[chosenObj];

    if (!searchString) {
      return res.status(400).send('Ungültiger Kanal-Typ');
    }

    const guildId = req.body.guildId;
    const channelId = req.body[chosenObj];
    const targetUrl = guildId
      ? `/channelselection?serverId=${guildId}`
      : '/channelselection';
    if (!channelId) {
      return res.redirect(targetUrl);
    }
    let srvCfg = await ServerConfig.findOne({
      guildId: guildId,
      variableName: searchString,
    });

    if (srvCfg) {
      srvCfg.objectId = channelId;
      await srvCfg.save();
    } else {
      srvCfg = new ServerConfig({
        guildId: guildId,
        variableName: searchString,
        objectId: channelId,
      });
      await srvCfg.save();
    }

    console.log(
      `ServerConfig updated for guild ${guildId}: ${searchString} set to ${channelId}`,
    );
    await refreshServerConfCache(guildId);
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('channelselection', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      alleTextChannels: [],
      alleVoiceChannels: [],
      defaultValues: {},
      uses: idUses,
      error: error.message,
    });
  }
});

module.exports = router;

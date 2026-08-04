const express = require('express');
const router = express.Router();
const ServerConfig = require('../../models/ServerConfig');
const idUses = require('../../utils/data/idUses');
const { ChannelType } = require('discord.js');
const ALLOWED_CHANNELS = new Set([
  'allgemein',
  'bye',
  'log',
  'bump',
  'quiz',
  'admin',
  'spiele',
  'vccreation',
  'afk',
]);

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
    let defaultValues = [];
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
    res.render('channelselection', {
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
    res.render('channelselction', {
      servers: null,
      selectedServerId: null,
      alleTextChannels: [],
      alleVoiceChannels: [],
      defaultValues: [],
      uses: idUses,
      error: error.message,
    });
  }
});

router.post('/change-channel-:chosenobj', async (req, res) => {
  try {
    const chosenObj = req.params.chosenobj;

    if (!ALLOWED_CHANNELS.has(chosenObj)) {
      return res.status(400).send('Ungültiger Kanal-Typ');
    }
    const guildId = req.body.guildId;
    let channelId;
    let searchString;
    switch (chosenObj) {
      case 'allgemein':
        channelId = req.body.allgemein;
        searchString = 'ALLGEMEIN_ID';
        break;
      case 'bye':
        channelId = req.body.bye;
        searchString = 'BYE_ID';
        break;
      case 'log':
        channelId = req.body.log;
        searchString = 'LOG_ID';
        break;
      case 'bump':
        channelId = req.body.bump;
        searchString = 'BUMP_ID';
        break;
      case 'quiz':
        channelId = req.body.quiz;
        searchString = 'QUIZ_ID';
        break;
      case 'admin':
        channelId = req.body.admin;
        searchString = 'ADMIN_C_ID';
        break;
      case 'spiele':
        channelId = req.body.spiele;
        searchString = 'SPIELE_ID';
        break;
      case 'vccreation':
        channelId = req.body.vccreation;
        searchString = 'VCCREATION_ID';
        break;
      case 'afk':
        channelId = req.body.afk;
        searchString = 'AFK_ID';
        break;
      default:
        break;
    }
    const targetUrl = guildId
      ? `/channelselection?serverId=${guildId}`
      : '/channelselection';
    if (!channelId && !searchString) {
      return res.redirect(targetUrl);
    }
    const srvCfg = await ServerConfig.findOne({
      guildId: guildId,
      variableName: searchString,
    });
    if (srvCfg && srvCfg.objectId != channelId) {
      srvCfg.objectId = channelId;
      await srvCfg.save();
    } else {
      const newSrvCfg = new ServerConfig({
        guildId: guildId,
        variableName: searchString,
        objectId: channelId,
      });
      newSrvCfg.save();
    }
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    res.render('channelselction', {
      servers: null,
      selectedServerId: null,
      alleTextChannels: [],
      alleVoiceChannels: [],
      defaultValues: [],
      uses: idUses,
      error: error.message,
    });
  }
});

module.exports = router;

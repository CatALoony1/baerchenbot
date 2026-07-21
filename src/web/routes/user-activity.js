const express = require('express');
const router = express.Router();
const Level = require('../../models/Level');
const Config = require('../../models/Config');

router.get('/', async (req, res) => {
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
  let users = [];
  let away = '';
  const allowedIds =
    allowedGuilds && allowedGuilds !== 'all'
      ? allowedGuilds.split(',').map((id) => id.trim())
      : [];

  const isAllowed =
    allowedGuilds === 'all' || allowedIds.includes(selectedServerId);
  if (selectedServerId && isAllowed) {
    const awayUsers = await Config.findOne({
      guildId: selectedServerId,
      key: 'away',
    });
    if (awayUsers && awayUsers.value) {
      away = awayUsers.value;
    }
    const allUsers = await Level.find({ guildId: selectedServerId }).lean();
    if (allUsers) {
      users = allUsers.map((user) => ({
        name: user.userName,
        lastMessage: getDaysAgo(user.lastMessage),
        messages: user.messages,
        voiceTime: getVoiceTime(user.voicetime),
      }));
    }
  }
  res.render('user-activity', {
    servers: servers,
    selectedServerId: selectedServerId,
    users: users,
    away: away,
  });
});

router.post('/away', async (req, res) => {
  const { username, serverId } = req.body;
  const awayUsers = await Config.findOne({
    guildId: serverId,
    key: 'away',
  });
  if (awayUsers && awayUsers.value) {
    awayUsers.value = `${awayUsers.value}${username},`;
    await awayUsers.save();
  } else {
    const newUser = new Config({
      guildId: serverId,
      key: 'away',
      value: `,${username},`,
    });
    await newUser.save();
  }
  const targetUrl = serverId
    ? `/user-activity?serverId=${serverId}`
    : '/user-activity';
  return res.redirect(targetUrl);
});

router.post('/back', async (req, res) => {
  const { username, serverId } = req.body;
  const awayUsers = await Config.findOne({
    guildId: serverId,
    key: 'away',
  });
  if (awayUsers && awayUsers.value) {
    let awayValue = awayUsers.value;
    if (awayValue.includes(',')) {
      if (awayValue.includes(`,${username}`)) {
        awayValue = awayValue.replace(`,${username}`, '');
      }
    } else {
      awayValue = ',';
    }
    awayUsers.value = awayValue;
    await awayUsers.save();
  }
  const targetUrl = serverId
    ? `/user-activity?serverId=${serverId}`
    : '/user-activity';
  return res.redirect(targetUrl);
});

function getDaysAgo(userDate) {
  const date = new Date(userDate);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffInMs = today - date;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

function getVoiceTime(duration) {
  let time;
  if (duration >= 60) {
    let h = 0;
    let m = duration;
    let isHour = true;
    while (isHour) {
      if (m >= 60) {
        m -= 60;
        h += 1;
      } else {
        isHour = false;
      }
    }
    time = `${h}h ${m}m`;
  } else {
    time = `${duration}m`;
  }
  return time;
}

module.exports = router;

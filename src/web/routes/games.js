const express = require('express');
require('dotenv').config();
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
    const allowedGuilds = req.session.guildIds;
    if (allowedGuilds !== 'all') {
      const allowedIds = allowedGuilds.split(',').map((id) => id.trim());
      servers = servers.filter((server) => allowedIds.includes(server.id));
    }
    const selectedServerId = req.query.serverId || servers[0]?.id;
    let moneyConfMap = new Map();
    if (selectedServerId) {
      const selectedGuild = client.guilds.cache.get(selectedServerId);
      if (selectedGuild) {
        const moneyConf = await Config.find({
          guildId: selectedServerId,
          key: { $regex: '^MONEY' },
        });
        moneyConfMap = new Map(moneyConf.map((item) => [item.key, item.value]));
      }
    }
    return res.render('games', {
      servers: servers,
      selectedServerId: selectedServerId,
      moneyConfMap: moneyConfMap,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.render('games', {
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      error: error.message,
    });
  }
});

router.post('/money', async (req, res) => {
  try {
    const { moneyName, moneyMessage, moneyLevelup, moneyBirthday, guildId } =
      req.body;
    console.log(
      `/money call with guildId: ${guildId}, moneyName: ${moneyName}, moneyMessage: ${moneyMessage}, moneyLevelup: ${moneyLevelup}, moneyBirthday: ${moneyBirthday}`,
    );
    const keyList = [
      'MONEY_NAME',
      'MONEY_LEVELUP',
      'MONEY_MESSAGE',
      'MONEY_BIRTHDAY',
    ];
    const valList = [moneyName, moneyLevelup, moneyMessage, moneyBirthday];
    await addToDb(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      error: error.message,
    });
  }
});

router.post('/quiz', async (req, res) => {
  try {
    const { quizAdd, quizRight, quizStreakPerc, guildId } = req.body;
    console.log(
      `/quiz call with guildId: ${guildId}, quizAdd: ${quizAdd}, quizRight: ${quizRight}, quizStreakPerc: ${quizStreakPerc}`,
    );
    const keyList = [
      'MONEY_QUIZ_ADD',
      'MONEY_QUIZ_RIGHT',
      'MONEY_QUIZ_STREAK_PERC',
    ];
    const valList = [quizAdd, quizRight, quizStreakPerc];
    await addToDb(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      error: error.message,
    });
  }
});

router.post('/hangman', async (req, res) => {
  try {
    const { hangmanSolve, guildId } = req.body;
    console.log(
      `/hangman call with guildId: ${guildId}, hangmanSolve: ${hangmanSolve}`,
    );
    const keyList = ['MONEY_HANGMAN_SOLVE'];
    const valList = [hangmanSolve];
    await addToDb(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      error: error.message,
    });
  }
});

router.post('/rad', async (req, res) => {
  try {
    const { radPool, radPerc, radMaxPerc, guildId } = req.body;
    console.log(
      `/rad call with guildId: ${guildId}, radPool: ${radPool}, radMaxPerc: ${radMaxPerc}, radPerc: ${radPerc}`,
    );
    const keyList = ['MONEY_RAD_POOL', 'MONEY_RAD_PERC', 'MONEY_RAD_MAX_PERC'];
    const valList = [radPool, radPerc, radMaxPerc];
    await addToDb(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      error: error.message,
    });
  }
});

router.post('/lotto', async (req, res) => {
  try {
    const {
      lotto1,
      lotto2,
      lotto3,
      lotto4,
      lotto5,
      lotto6,
      lotto7,
      lottoMax,
      guildId,
    } = req.body;
    console.log(
      `/lotto call with guildId: ${guildId}, lotto1: ${lotto1}, lotto2: ${lotto2}, lotto3: ${lotto3}, lotto4: ${lotto4}, lotto5: ${lotto5}, lotto6: ${lotto6}, lotto7: ${lotto7}, lottoMax: ${lottoMax}`,
    );
    const keyList = [
      'MONEY_LOTTO_1',
      'MONEY_LOTTO_2',
      'MONEY_LOTTO_3',
      'MONEY_LOTTO_4',
      'MONEY_LOTTO_5',
      'MONEY_LOTTO_6',
      'MONEY_LOTTO_7',
      'MONEY_LOTTO_MAX',
    ];
    const valList = [
      lotto1,
      lotto2,
      lotto3,
      lotto4,
      lotto5,
      lotto6,
      lotto7,
      lottoMax,
    ];
    await addToDb(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      error: error.message,
    });
  }
});

async function addToDb(keyList, valList, guildId) {
  const remainingKeys = [...keyList];
  const remainingVals = [...valList];

  const cfg = await Config.find({
    guildId: guildId,
    key: { $regex: '^MONEY' },
  });

  for (const conf of cfg) {
    const index = remainingKeys.indexOf(conf.key);
    if (index !== -1) {
      conf.value = remainingVals[index];
      await conf.save();
      remainingKeys.splice(index, 1);
      remainingVals.splice(index, 1);
    }
  }

  if (remainingKeys.length > 0) {
    for (let i = 0; i < remainingKeys.length; i++) {
      const newConf = new Config({
        guildId: guildId,
        key: remainingKeys[i],
        value: remainingVals[i],
      });
      await newConf.save();
    }
  }
  await refreshConfCache(guildId);
}

module.exports = router;

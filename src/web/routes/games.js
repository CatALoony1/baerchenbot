const express = require('express');
require('dotenv').config();
const router = express.Router();
const Config = require('../../models/Config');
const Items = require('../../models/Items');
const { refreshConfCache } = require('../../utils/data/cache');
const itemMap = require('../../utils/data/Items');

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
    let itemConfMap = new Map();
    let itemsMap = new Map();
    if (selectedServerId) {
      const selectedGuild = client.guilds.cache.get(selectedServerId);
      if (selectedGuild) {
        const moneyConf = await Config.find({
          guildId: selectedServerId,
          key: { $regex: '^MONEY' },
        });
        moneyConfMap = new Map(moneyConf.map((item) => [item.key, item.value]));
        const gameConf = await Config.find({
          guildId: selectedServerId,
          key: {
            $in: [
              'BOMB_EX_MIN',
              'BOMB_EX_MAX',
              'BOMB_DEF_MIN',
              'BOMB_DEF_MAX',
              'KLAU_BANANE_MIN',
              'KLAU_BANANE_MAX',
            ],
          },
        });
        itemConfMap = new Map(gameConf.map((item) => [item.key, item.value]));
        const availableItems = await Items.find({ guildId: selectedServerId });
        itemsMap = new Map(
          Array.from(itemMap.entries()).map(([key, value]) => {
            const itemInAvailable = availableItems.some(
              (item) => item.name === key,
            );
            let price = 0;
            let boostonly = false;
            if (itemInAvailable) {
              price = availableItems.find((item) => item.name === key).preis;
              boostonly = availableItems.find(
                (item) => item.name === key,
              ).boostOnly;
            }
            return [
              key,
              {
                description: value,
                available: itemInAvailable,
                price: price,
                boostonly: boostonly,
              },
            ];
          }),
        );
      }
    }
    return res.render('games', {
      guildIds: req.session.guildIds,
      servers: servers,
      selectedServerId: selectedServerId,
      moneyConfMap: moneyConfMap,
      itemConfMap: itemConfMap,
      itemsMap: itemsMap,
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.render('games', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      itemConfMap: new Map(),
      itemsMap: new Map(),
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
    await addToDbMoney(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      itemConfMap: new Map(),
      itemsMap: new Map(),
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
    await addToDbMoney(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      itemConfMap: new Map(),
      itemsMap: new Map(),
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
    await addToDbMoney(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      itemConfMap: new Map(),
      itemsMap: new Map(),
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
    await addToDbMoney(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      itemConfMap: new Map(),
      itemsMap: new Map(),
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
    await addToDbMoney(keyList, valList, guildId);
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      guildIds: req.session.guildIds,
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      itemConfMap: new Map(),
      itemsMap: new Map(),
      error: error.message,
    });
  }
});

router.post('/items', async (req, res) => {
  try {
    const { guildId, singleSave } = req.body;
    const itemList = new Set();
    const additionalSaves = new Set();
    const loeschListe = new Set();
    if (singleSave) {
      const itemName = singleSave;
      addItemToList(
        req,
        itemName,
        itemList,
        additionalSaves,
        loeschListe,
        guildId,
      );
    } else {
      for (const itemName of itemMap.keys()) {
        addItemToList(
          req,
          itemName,
          itemList,
          additionalSaves,
          loeschListe,
          guildId,
        );
      }
    }
    await addToDbItems(itemList, additionalSaves, guildId);
    if (loeschListe.size > 0) {
      await deleteFromDbItems(loeschListe, guildId);
    }
    const targetUrl = guildId ? `/games?serverId=${guildId}` : '/games';
    return res.redirect(targetUrl);
  } catch (error) {
    console.log(error);
    return res.render('games', {
      servers: null,
      selectedServerId: null,
      moneyConfMap: new Map(),
      itemConfMap: new Map(),
      itemsMap: new Map(),
      error: error.message,
    });
  }
});

async function deleteFromDbItems(loeschListe, guildId) {
  const itemNames = Array.from(loeschListe);
  await Items.deleteMany({
    guildId: guildId,
    name: { $in: itemNames },
  });
}

function addItemToList(
  req,
  itemName,
  itemList,
  additionalSaves,
  loeschListe,
  guildId,
) {
  const available = req.body[`available_${itemName}`];
  const price = req.body[`price_${itemName}`];
  const boostOnly = req.body[`boost_${itemName}`];
  if (available) {
    const item = new Items({
      name: itemName,
      beschreibung: itemMap.get(itemName),
      preis: price,
      boostOnly: boostOnly,
      guildId: guildId,
    });
    itemList.add(item);
    if (itemName === 'Bombe') {
      additionalSaves.add(
        new Config({
          key: 'BOMB_EX_MIN',
          value: req.body['BOMB_EX_MIN'],
          guildId: guildId,
        }),
      );
      additionalSaves.add(
        new Config({
          key: 'BOMB_EX_MAX',
          value: req.body['BOMB_EX_MAX'],
          guildId: guildId,
        }),
      );
      additionalSaves.add(
        new Config({
          key: 'BOMB_DEF_MIN',
          value: req.body['BOMB_DEF_MIN'],
          guildId: guildId,
        }),
      );
      additionalSaves.add(
        new Config({
          key: 'BOMB_DEF_MAX',
          value: req.body['BOMB_DEF_MAX'],
          guildId: guildId,
        }),
      );
    } else if (itemName === 'Klau-Banane') {
      additionalSaves.add(
        new Config({
          key: 'KLAU_BANANE_MIN',
          value: req.body['KLAU_BANANE_MIN'],
          guildId: guildId,
        }),
      );
      additionalSaves.add(
        new Config({
          key: 'KLAU_BANANE_MAX',
          value: req.body['KLAU_BANANE_MAX'],
          guildId: guildId,
        }),
      );
    }
  } else {
    loeschListe.add(itemName);
  }
}

async function addToDbItems(itemList, additionalSaves, guildId) {
  const itemsArray = Array.from(itemList);
  if (itemsArray.length > 0) {
    const bulkOps = itemsArray.map((item) => ({
      updateOne: {
        filter: {
          name: item.name,
          preis: item.guildId,
        },
        update: { $set: item },
        upsert: true,
      },
    }));
    await Items.bulkWrite(bulkOps, { ordered: false });
  }
  const additionalArray = Array.from(additionalSaves);
  if (additionalArray.length > 0) {
    const bulkOps = additionalArray.map((config) => ({
      updateOne: {
        filter: {
          name: config.name,
          preis: config.guildId,
        },
        update: { $set: config },
        upsert: true,
      },
    }));
    await Config.bulkWrite(bulkOps, { ordered: false });
    await refreshConfCache(guildId);
  }
}

async function addToDbMoney(keyList, valList, guildId) {
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

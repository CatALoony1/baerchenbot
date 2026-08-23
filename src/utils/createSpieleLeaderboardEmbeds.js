const { EmbedBuilder } = require('discord.js');
const GameUser = require('../models/GameUser.js');
require('../models/Bankkonten.js');
const { confCache } = require('../utils/data/cache');

async function createSpieleLeaderboardEmbeds(page, interaction) {
  const fetchedGameUsers = await GameUser.find({
    guildId: interaction.guild.id,
  }).populate('bankkonto');

  if (fetchedGameUsers.length === 0) {
    console.log(
      `ERROR: Niemand auf dem Server hat ${confCache.get(interaction.guild.id).get('MONEY_NAME')}!`,
    );
    return;
  }
  let oldUsers = [];
  for (let j = 0; j < fetchedGameUsers.length; j++) {
    if (
      !interaction.guild.members.cache.find(
        (m) => m.id === fetchedGameUsers[j].userId,
      )?.id
    ) {
      oldUsers[oldUsers.length] = j;
    }
  }
  for (let j = 0; j < oldUsers.length; j++) {
    fetchedGameUsers.splice(oldUsers[j] - j, 1);
  }
  fetchedGameUsers.sort((a, b) => {
    if (a.bankkonto.currentMoney === b.bankkonto.currentMoney) {
      return b.bankkonto.moneyGain - a.bankkonto.moneyGain;
    } else {
      return b.bankkonto.currentMoney - a.bankkonto.currentMoney;
    }
  });
  let i = 0 + page * 5;
  const max = 5 + page * 5;
  const embed = new EmbedBuilder()
    .setTitle(`Rangliste`)
    .setDescription(`${page + 1}/${Math.ceil(fetchedGameUsers.length / 5)}`)
    .setColor(0x0033cc);
  for (i; i < max; i++) {
    if (i === fetchedGameUsers.length) {
      break;
    }
    const userObj = await interaction.guild.members.fetch(
      fetchedGameUsers[i].userId,
    );
    let value;
    if (i === max - 1 || i === fetchedGameUsers.length - 1) {
      value = `${confCache.get(interaction.guild.id).get('MONEY_NAME')}: ${fetchedGameUsers[i].bankkonto.currentMoney}\n Gewinn: ${fetchedGameUsers[i].bankkonto.moneyGain} Verlust: ${fetchedGameUsers[i].bankkonto.moneyLost}`;
    } else {
      value = `${confCache.get(interaction.guild.id).get('MONEY_NAME')}: ${fetchedGameUsers[i].bankkonto.currentMoney}\n Gewinn: ${fetchedGameUsers[i].bankkonto.moneyGain} Verlust: ${fetchedGameUsers[i].bankkonto.moneyLost}\n--------------------------------------`;
    }
    embed.addFields({
      name: `#${i + 1}  ${userObj.user.username}`,
      value: value,
    });
  }
  return embed;
}

module.exports = createSpieleLeaderboardEmbeds;

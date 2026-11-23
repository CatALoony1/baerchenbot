const removeMoney = require('../removeMoney');
const giveMoney = require('../giveMoney');
const Gluecksrad = require('../../models/Gluecksrad');
const GameUser = require('../../models/GameUser');
require('../../models/Bankkonten');
const { confCache } = require('../data/cache');

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomNotFloor(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.random() * (max - min + 1) + min;
}

async function gluecksrad(interaction) {
  try {
    const startpool = Number(
      confCache.get(interaction.guild.id).get('MONEY_RAD_POOL'),
    );
    const perc = Number(
      confCache.get(interaction.guild.id).get('MONEY_RAD_PERC'),
    );
    const maxperc = Number(
      confCache.get(interaction.guild.id).get('MONEY_RAD_MAX_PERC'),
    );
    if (!interaction.inGuild()) {
      interaction.reply('Hier ist doch kein Server!');
      return;
    }
    await interaction.deferReply();
    let einsatz = Number(
      confCache.get(interaction.guild.id).get('MONEY_RAD_EINSATZ'),
    );
    const user = await GameUser.findOne({
      userId: interaction.user.id,
      guildId: interaction.guild.id,
    }).populate('bankkonto');
    if (!user || !user.bankkonto || user.bankkonto.currentMoney < einsatz) {
      interaction.editReply(
        `Du hast nicht genug ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'}, um ${einsatz} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'} zu setzen!`,
      );
      return;
    }
    const zufallsZahl = getRandomNotFloor(1, 100);
    let gluecksrad = await Gluecksrad.findOne({
      guildId: interaction.guild.id,
    });
    if (!gluecksrad) {
      gluecksrad = new Gluecksrad({
        guildId: interaction.guild.id,
        pool: startpool,
      });
    }
    let gewinnchance = perc + (gluecksrad.pool - startpool) / (startpool / 2);
    if (gewinnchance > maxperc) {
      gewinnchance = maxperc;
    }
    const targetUserObj = interaction.member;
    await removeMoney(targetUserObj, einsatz);
    await interaction.editReply(
      `Dein Einsatz in Höhe von ${einsatz} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'} wurde abgezogen!`,
    );
    const delay = 1000;
    let sleep = async (ms) => await new Promise((r) => setTimeout(r, ms));
    await sleep(delay);
    const gewinnVerlust = getRandom(1, 10) / 10;
    let result = Math.floor(gewinnVerlust * gluecksrad.pool);
    if (zufallsZahl <= gewinnchance) {
      if (result == einsatz) {
        await giveMoney(targetUserObj, result);
        await interaction.editReply(
          `Du hast deinen Einsatz von ${einsatz} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'} zurückgewonnen!\n\nGewinnchance: ${gewinnchance}% | Pool: ${gluecksrad.pool} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'}`,
        );
      } else if (result == gluecksrad.pool) {
        await giveMoney(targetUserObj, result);
        await interaction.editReply(
          `Du hast den Jackpot geknackt und ${result} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'} gewonnen!\n\nGewinnchance: ${gewinnchance}% | Pool: ${gluecksrad.pool} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'}`,
        );
      } else {
        await giveMoney(targetUserObj, result);
        await interaction.editReply(
          `Du hast ${result} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'} gewonnen!\n\nGewinnchance: ${gewinnchance}% | Pool: ${gluecksrad.pool} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'}`,
        );
      }
      result = result * -1;
    } else {
      result = Math.floor(result / 2);
      await interaction.editReply(
        `Du hast ${result} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'} verloren!\n\nGewinnchance: ${gewinnchance}% | Pool: ${gluecksrad.pool} ${confCache.get(interaction.guild.id).get('MONEY_NAME') || 'Geld'}`,
      );
      await removeMoney(targetUserObj, result);
    }
    gluecksrad.pool = gluecksrad.pool + result;
    if (gluecksrad.pool < startpool) {
      gluecksrad.pool = startpool;
    }
    await gluecksrad.save();
  } catch (error) {
    console.log(error);
  }
}

module.exports = gluecksrad;

const GameUser = require('../models/GameUser.js');
const Bankkonten = require('../models/Bankkonten.js');
const Inventar = require('../models/Inventar.js');
const { confCache, serverConfCache } = require('./data/cache');

async function giveMoney(member, money, quizadded = false, daily = false) {
  const query = {
    userId: member.user.id,
    guildId: member.guild.id,
  };
  try {
    const user = await GameUser.findOne(query).populate('bankkonto');
    if (user) {
      if (quizadded) {
        if (user.quizadded > 0 && user.quizadded <= 10) {
          money = money + user.quizadded * 100;
        } else if (user.quizadded > 10 && user.quizadded <= 30) {
          money = money + user.quizadded * 50;
        } else if (user.quizadded > 30 && user.quizadded <= 100) {
          money = money + user.quizadded * 20;
        } else if (user.quizadded > 100) {
          money = money + user.quizadded * 10;
        }
      }
      if (
        confCache.get(member.guild.id) &&
        serverConfCache.get(member.guild.id) &&
        confCache.get(member.guild.id).get('MONEY_BOOSTER_PERC') &&
        Number(confCache.get(member.guild.id).get('MONEY_BOOSTER_PERC')) > 0 &&
        serverConfCache.get(member.guild.id).get('BOOSTER_ROLE_ID') &&
        member.roles.cache.some(
          (role) =>
            role.id ===
            serverConfCache.get(member.guild.id).get('BOOSTER_ROLE_ID'),
        )
      ) {
        money = Math.ceil(
          money *
            ((100 +
              Number(
                confCache.get(member.guild.id).get('MONEY_BOOSTER_PERC'),
              )) /
              100),
        );
      }
      if (daily) {
        user.daily = new Date();
      }
      if (quizadded) {
        user.quizadded += 1;
      }
      console.log(`user ${member.user.tag} received ${money} Geld`);
      user.bankkonto.currentMoney += money;
      user.bankkonto.moneyGain += money;
      await user.bankkonto.save().catch((e) => {
        console.log(`Error saving updated bankkonto ${e}`);
        return;
      });
      if (quizadded || daily) {
        await user.save().catch((e) => {
          console.log(`Error saving updated quizadded ${e}`);
          return;
        });
      }
    } else {
      console.log(`user ${member.user.tag} received ${money} Geld`);
      console.log(`new user ${member.user.tag} added to database`);
      const newUser = new GameUser({
        userId: member.user.id,
        guildId: member.guild.id,
      });
      if (daily) {
        newUser.daily = new Date();
      }
      const newBankkonto = new Bankkonten({
        besitzer: newUser._id,
        currentMoney: money,
        moneyGain: money,
      });
      const newInventar = new Inventar({
        besitzer: newUser._id,
      });
      await newBankkonto.save();
      await newInventar.save();
      await newUser.save();
    }
    return money;
  } catch (error) {
    console.log(error);
  }
}

module.exports = giveMoney;

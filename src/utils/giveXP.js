const Level = require('../models/Level');
const { EmbedBuilder } = require('discord.js');
const calculateLevelXp = require('../utils/calculateLevelXp');
const giveMoney = require('../utils/giveMoney');
require('dotenv').config();
const Config = require('../models/Config');

const roles = new Map([
  [1, '1387045161019899914'],
  [5, '1387045216426524743'],
  [10, '1387045823652696166'],
  [15, '1387046027156262954'],
  [20, '1387046067857653790'],
  [25, '1387046124497539123'],
  [30, '1387046221176246352'],
  [35, '1387046270069243934'],
  [40, '1387046368358563871'],
  [45, '1387046418916573204'],
  [50, '1387046461631365150'],
]);

async function giveXP(member, xpToGive, channel, message) {
  const query = {
    userId: member.user.id,
    guildId: member.guild.id,
  };
  try {
    const level = await Level.findOne(query);
    let confQuery = {
      guildId: member.guild.id,
      key: 'xpMultiplier',
    };
    let conf = await Config.findOne(confQuery);
    let multiplier = 1;
    if (conf) {
      multiplier = Number(conf.value);
    }
    let xpAmount = xpToGive * multiplier;
    if (level) {
      if (member.roles.cache.some((role) => role.name === 'Bumper')) {
        xpAmount = Math.ceil(xpAmount * 1.1);
      }
      if (member.roles.cache.some((role) => role.name === 'Server Booster')) {
        xpAmount = Math.ceil(xpAmount * 1.15);
      }
      if (message) {
        level.messagexp += xpAmount;
        level.messages += 1;
      } else {
        level.voicexp += xpAmount;
        level.voicetime += 5;
      }
      console.log(`user ${member.user.tag} received ${xpAmount} XP`);
      level.xp += xpAmount;
      level.allxp += xpAmount;
      level.thismonth += xpAmount;
      level.lastMessage = Date.now();
      let money = 0;
      if (level.xp >= calculateLevelXp(level.level)) {
        do {
          level.xp = level.xp - calculateLevelXp(level.level);
          level.level += 1;
          console.log(`user ${member.user.tag} reached level ${level.level}`);
          let description = `🎉 Glückwunsch ${member}! Du hast **Level ${level.level}** erreicht!`;

          if (roles.has(level.level)) {
            let newRole = roles.get(level.level);
            for (const value of roles.values()) {
              if (member.roles.cache.has(value)) {
                let tempRole = member.guild.roles.cache.get(value);
                await member.guild.members.cache
                  .get(member.user.id)
                  .roles.remove(tempRole);
                console.log(
                  `Role ${value} was removed from user ${member.user.tag}`,
                );
              }
            }
            let role = member.guild.roles.cache.get(newRole);
            await member.guild.members.cache
              .get(member.user.id)
              .roles.add(role);
            description = `🎉 Glückwunsch ${member}! Du hast **Level ${level.level}** erreicht und bist somit zum ${role.name} aufgestiegen!`;
            console.log(
              `Role ${role.name} was given to user ${member.user.tag}`,
            );
            if (level.level === 1) {
              let memberRole = member.guild.roles.cache.get(
                process.env.MITGLIED_ROLE_ID,
              );
              await member.guild.members.cache
                .get(member.user.id)
                .roles.add(memberRole);
              console.log(`Role Mitglied was given to user ${member.user.tag}`);
              let newMemberRole = member.guild.roles.cache.get(
                process.env.NEWMEMBER_ROLE_ID,
              );
              await member.guild.members.cache
                .get(member.user.id)
                .roles.remove(newMemberRole);
              console.log(
                `Role NewMember was removed from user ${member.user.tag}`,
              );
            }
            money += 10000;
          } else {
            money += 2000;
          }
          const embed = new EmbedBuilder()
            .setTitle('Glückwunsch!')
            .setDescription(description)
            .setThumbnail(
              member.user.displayAvatarURL({ format: 'png', dynamic: true }),
            )
            .setColor(0x0033cc);
          channel.send({ embeds: [embed] });
        } while (level.xp >= calculateLevelXp(level.level));
      }
      await level.save().catch((e) => {
        console.log(`Error saving updated level ${e}`);
        return;
      });
      if (money > 0) {
        await giveMoney(member, money);
      }
    } else {
      console.log(`user ${member.user.tag} received ${xpAmount} XP`);
      console.log(`new user ${member.user.tag} added to database`);
      const newLevel = new Level({
        userId: member.user.id,
        guildId: member.guild.id,
        xp: xpAmount,
        allxp: xpAmount,
        messages: 0,
        lastMessage: Date.now(),
        userName: member.user.tag,
        messagexp: 0,
        voicexp: 0,
        voicetime: 0,
        thismonth: xpAmount,
        bumps: 0,
      });
      if (message) {
        newLevel.messagexp += xpAmount;
        newLevel.messages += 1;
      } else {
        newLevel.voicexp += xpAmount;
        newLevel.voicetime += 5;
      }
      await newLevel.save();
    }
    return xpAmount;
  } catch (error) {
    console.log(error);
  }
}

module.exports = giveXP;

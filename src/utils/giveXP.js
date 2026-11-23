const Level = require('../models/Level');
const { EmbedBuilder } = require('discord.js');
const calculateLevelXp = require('../utils/calculateLevelXp');
const giveMoney = require('../utils/giveMoney');
const { serverConfCache, confCache } = require('./data/cache');

async function giveXP(member, channel, message) {
  const query = {
    userId: member.user.id,
    guildId: member.guild.id,
  };
  try {
    let xpAmount = 0;
    if (confCache.get(member.guild.id)) {
      if (message && confCache.get(member.guild.id).get('LVL_XP_MSG')) {
        xpAmount = Number(confCache.get(member.guild.id).get('LVL_XP_MSG'));
      } else if (!message && confCache.get(member.guild.id).get('LVL_XP_VC')) {
        xpAmount = Number(confCache.get(member.guild.id).get('LVL_XP_VC')) * 5;
      } else {
        return 0;
      }
      const level = await Level.findOne(query);
      const multiplier = confCache.get(member.guild.id).get('xpMultiplier')
        ? Number(confCache.get(member.guild.id).get('xpMultiplier'))
        : 1;
      xpAmount = xpAmount * multiplier;
      if (level) {
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
        const levelXp = calculateLevelXp(level.level, member.guild.id);
        if (levelXp !== 0 && level.xp >= levelXp) {
          do {
            level.xp =
              level.xp - calculateLevelXp(level.level, member.guild.id);
            level.level += 1;
            console.log(`user ${member.user.tag} reached level ${level.level}`);
            let description =
              confCache.get(member.guild.id).get('LVL_UP_TEXT') || null;
            if (description) {
              description = description
                .replaceAll('[lvl]', level.level)
                .replaceAll('[userPing]', `<@${member.user.id}>`)
                .replaceAll('[userName]', member.user.displayName);
            }
            if (
              confCache.get(member.guild.id).get('LVL_ROLE') &&
              level.level > 0 &&
              level.level %
                Number(confCache.get(member.guild.id).get('LVL_ROLE')) ===
                0 &&
              confCache.get(member.guild.id).get('LVL_ROLES')
            ) {
              const roleNum = Math.floor(
                level.level /
                  Number(confCache.get(member.guild.id).get('LVL_ROLE')),
              );
              const lvlRolesSys =
                confCache.get(member.guild.id).get('LVL_ROLES') == 'J';
              let newRole = null;
              let oldRole = null;
              if (
                lvlRolesSys &&
                confCache.get(member.guild.id).get('LVL_CUS_NAME')
              ) {
                const tempRoles = confCache
                  .get(member.guild.id)
                  .get('LVL_CUS_NAME')
                  .split(',');
                if (tempRoles.length >= roleNum) {
                  newRole = tempRoles[roleNum - 1];
                  oldRole = tempRoles[roleNum - 2];
                }
              } else if (
                !lvlRolesSys &&
                confCache.get(member.guild.id).get('LVL_NUM_NAME')
              ) {
                newRole = confCache
                  .get(member.guild.id)
                  .get('LVL_NUM_NAME')
                  .replaceAll('[lvl]', level.level)
                  .replaceAll('[role]', roleNum);
                oldRole = confCache
                  .get(member.guild.id)
                  .get('LVL_NUM_NAME')
                  .replaceAll(
                    '[lvl]',
                    level.level -
                      Number(confCache.get(member.guild.id).get('LVL_ROLE')),
                  )
                  .replaceAll('[role]', roleNum - 1);
              }
              if (newRole) {
                if (oldRole) {
                  const oldRoleObj = member.guild.roles.cache.find(
                    (r) => r.name === oldRole,
                  );
                  if (oldRoleObj && member.roles.cache.has(oldRoleObj.id)) {
                    await member.roles.remove(oldRoleObj);
                    console.log(
                      `Role ${oldRoleObj.id}: ${oldRoleObj.name} was removed from user ${member.user.tag}`,
                    );
                  }
                }
                let role = member.guild.roles.cache.find(
                  (r) => r.name === newRole,
                );
                if (!role) {
                  role = await member.guild.roles.create({
                    name: newRole,
                    reason: 'Neue Levelrolle',
                  });
                }
                await member.roles.add(role);
                description =
                  confCache.get(member.guild.id).get('LVL_UP_TEXT_ROLE') ||
                  null;
                if (description) {
                  description = description
                    .replaceAll('[lvl]', level.level)
                    .replaceAll('[userPing]', `<@${member.user.id}>`)
                    .replaceAll('[userName]', member.user.displayName)
                    .replaceAll('[role]', role.name);
                }
                console.log(
                  `Role ${role.name} was given to user ${member.user.tag}`,
                );
              }
              if (level.level === 1) {
                if (
                  serverConfCache.get(member.guild.id) &&
                  serverConfCache.get(member.guild.id).get('MITGLIED_ROLE_ID')
                ) {
                  let memberRole = member.guild.roles.cache.get(
                    serverConfCache
                      .get(member.guild.id)
                      .get('MITGLIED_ROLE_ID'),
                  );
                  await member.guild.members.cache
                    .get(member.user.id)
                    .roles.add(memberRole);
                  console.log(
                    `Role Mitglied was given to user ${member.user.tag}`,
                  );
                }
                if (confCache.get(member.guild.id).get('MONEY_LEVELUP')) {
                  money += Number(
                    confCache.get(member.guild.id).get('MONEY_LEVELUP'),
                  );
                }
              }
            } else {
              if (
                confCache.get(member.guild.id).get('MONEY_MESSAGE') &&
                message
              ) {
                money += Number(
                  confCache.get(member.guild.id).get('MONEY_MESSAGE'),
                );
              } else if (
                confCache.get(member.guild.id).get('MONEY_VOICE') &&
                !message
              ) {
                money += Number(
                  confCache.get(member.guild.id).get('MONEY_VOICE') * 5,
                );
              }
            }
            if (description) {
              const embed = new EmbedBuilder()
                .setTitle('Glückwunsch!')
                .setDescription(description)
                .setThumbnail(
                  member.user.displayAvatarURL({
                    format: 'png',
                    dynamic: true,
                  }),
                )
                .setColor(0x0033cc);
              channel.send({ embeds: [embed] });
            }
          } while (level.xp >= calculateLevelXp(level.level, member.guild.id));
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
    }
    return xpAmount;
  } catch (error) {
    console.log(error);
  }
}

module.exports = giveXP;

const { confCache } = require('./data/cache');

function calculateLevelXp(level, guildId) {
  if (
    confCache.get(member.guild.id) &&
    confCache.get(member.guild.id).get('LVL_XP_LVLUP') &&
    confCache.get(member.guild.id).get('LVL_SYS')
  ) {
    const lvlSys = confCache.get(member.guild.id).get('LVL_SYS') == 'J';
    const xpPerLevel = Number(
      confCache.get(member.guild.id).get('LVL_XP_LVLUP'),
    );
    if (lvlSys) {
      return xpPerLevel;
    } else {
      return xpPerLevel * (level + 1);
    }
  }
  return 0;
}
module.exports = calculateLevelXp;

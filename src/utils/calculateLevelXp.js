const { confCache } = require('./data/cache');

function calculateLevelXp(level, guildId) {
  if (
    confCache.get(guildId) &&
    confCache.get(guildId).get('LVL_XP_LVLUP') &&
    confCache.get(guildId).get('LVL_SYS')
  ) {
    const lvlSys = confCache.get(guildId).get('LVL_SYS') == 'J';
    const xpPerLevel = Number(confCache.get(guildId).get('LVL_XP_LVLUP'));
    if (lvlSys) {
      return xpPerLevel;
    } else {
      return xpPerLevel * (level + 1);
    }
  }
  return 0;
}
module.exports = calculateLevelXp;

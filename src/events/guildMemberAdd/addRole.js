const { serverConfCache } = require('../../utils/data/cache');
module.exports = {
  run: async (guildMember) => {
    if (
      serverConfCache.get(guildMember.guild.id) &&
      serverConfCache.get(guildMember.guild.id).get('NEWMEMBER_ROLE_ID')
    ) {
      const role = guildMember.guild.roles.cache.get(
        serverConfCache.get(guildMember.guild.id).get('NEWMEMBER_ROLE_ID'),
      );
      await guildMember.guild.members.cache.get(guildMember.id).roles.add(role);
    }
  },
};

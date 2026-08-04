const { EmbedBuilder } = require('discord.js');
const QuizStats = require('../models/QuizStats');
async function createQuizLeaderboardEmbeds(page, client, guildId) {
  const guild = client.guilds.cache.get(guildId);
  const fetchedStats = await QuizStats.find({
    guildId: guildId,
  });

  if (fetchedStats.length === 0) {
    console.log('ERROR: Niemand auf dem Server hat Level');
    return;
  }
  let oldUsers = [];
  for (let j = 0; j < fetchedStats.length; j++) {
    if (!guild.members.cache.find((m) => m.id === fetchedStats[j].userId)?.id) {
      oldUsers[oldUsers.length] = j;
    }
  }
  for (let j = 0; j < oldUsers.length; j++) {
    fetchedStats.splice(oldUsers[j] - j, 1);
  }
  fetchedStats.sort((a, b) => {
    if (a.right === b.right) {
      return a.wrong - b.wrong;
    } else {
      return b.right - a.right;
    }
  });

  let i = 0 + page * 5;
  const max = 5 + page * 5;
  const embed = new EmbedBuilder()
    .setTitle(`Rangliste`)
    .setDescription(`${page + 1}/${Math.ceil(fetchedStats.length / 5)}`)
    .setColor(0x0033cc);
  for (i; i < max; i++) {
    if (i === fetchedStats.length) {
      break;
    }
    const userObj = await guild.members.fetch(fetchedStats[i].userId);
    let value;
    if (i === max - 1 || i === fetchedStats.length - 1) {
      value = `Richtig: ${fetchedStats[i].right} Falsch: ${fetchedStats[i].wrong}\n Letzte Teilnahme: ${fetchedStats[i].lastParticipation}`;
    } else {
      value = `Richtig: ${fetchedStats[i].right} Falsch: ${fetchedStats[i].wrong}\n Letzte Teilnahme: ${fetchedStats[i].lastParticipation}\n--------------------------------------`;
    }
    embed.addFields({
      name: `#${i + 1}  ${userObj.user.username}`,
      value: value,
    });
  }
  return embed;
}

module.exports = createQuizLeaderboardEmbeds;

const { EmbedBuilder } = require('discord.js');
const Items = require('../models/Items');
const { confCache } = require('../utils/data/cache');

async function createLeaderboardEmbeds(page, interaction) {
  const booster = interaction.member.roles.cache.some(
    (role) => role.name === 'Server Booster',
  )
    ? true
    : false;
  let allItems = await Items.find({ guildId: interaction.guild.id });
  let price = allItems[page].preis;
  if (!booster && allItems[page].boostOnly) {
    price = price * 10;
  }
  const embed = new EmbedBuilder()
    .setTitle(`Shop - ${page + 1}/${allItems.length}`)
    .setDescription(
      `Name: ${allItems[page].name}\nPreis: ${price.toLocaleString('de-DE')} ${confCache.get(interaction.guild.id).get('MONEY_NAME')}\nBeschreibung: ${allItems[page].beschreibung}`,
    )
    .setColor(0x0033cc);
  return embed;
}

module.exports = createLeaderboardEmbeds;

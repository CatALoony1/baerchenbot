const { EmbedBuilder } = require('discord.js');
const Items = require('../models/Items');
const { confCache } = require('../utils/data/cache');

async function createShopEmbeds(page, interaction) {
  let allItems = await Items.find({ guildId: interaction.guild.id });
  let price = allItems[page].preis;
  const embed = new EmbedBuilder()
    .setTitle(`Shop - ${page + 1}/${allItems.length}`)
    .setDescription(
      `Name: ${allItems[page].name}\nPreis: ${price.toLocaleString('de-DE')} ${confCache.get(interaction.guild.id).get('MONEY_NAME')}\nBeschreibung: ${allItems[page].beschreibung}`,
    )
    .setColor(0x0033cc);
  return embed;
}

module.exports = createShopEmbeds;

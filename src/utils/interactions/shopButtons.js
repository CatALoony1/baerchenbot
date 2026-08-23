const { MessageFlags, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const createShopEmbeds = require('../createShopEmbeds');
const GameUser = require('../../models/GameUser');
require('../../models/Bankkonten');
require('../../models/Inventar');
const Items = require('../../models/Items');
const removeMoney = require('../removeMoney');
require('dotenv').config();
const { confCache } = require('../data/cache');

async function shopButtons(interaction) {
  let targetMessage = await interaction.channel.messages.fetch(
    interaction.message.id,
  );
  let targetMessageEmbed = targetMessage.embeds[0];
  let [, pageSlash] = targetMessageEmbed.title.split(' - ');
  let [currentPage, maxPage] = pageSlash.split('/');
  currentPage = parseInt(currentPage);
  maxPage = parseInt(maxPage);
  if (interaction.customId === 'shopDown') {
    try {
      let newPage;
      if (currentPage === 1) {
        newPage = maxPage;
      } else {
        newPage = currentPage - 1;
      }
      await interaction.update({
        embeds: [await createShopEmbeds(newPage - 1, interaction)],
        components: [targetMessage.components[0], targetMessage.components[1]],
      });
      return;
    } catch (error) {
      console.log(error);
    }
  } else if (interaction.customId === 'shopUp') {
    try {
      let newPage;
      if (currentPage === maxPage) {
        newPage = 1;
      } else {
        newPage = currentPage + 1;
      }
      await interaction.update({
        embeds: [await createShopEmbeds(newPage - 1, interaction)],
        components: [targetMessage.components[0], targetMessage.components[1]],
      });
      return;
    } catch (error) {
      console.log(error);
    }
  } else if (interaction.customId === 'shopBuy') {
    try {
      const description = targetMessageEmbed.description;
      const itemName = description.substring(
        description.indexOf('Name:') + 6,
        description.indexOf('\n'),
      );
      const price = parseInt(
        description
          .substring(
            description.indexOf('Preis:') + 7,
            description.indexOf(
              confCache.get(interaction.guild.id).get('MONEY_NAME'),
            ) - 1,
          )
          .replaceAll('.', ''),
      );
      console.log(`Item: ${itemName}, Price: ${price}`);
      const user = await GameUser.findOne({ userId: interaction.user.id })
        .populate('bankkonto')
        .populate({
          path: 'inventar',
          populate: { path: 'items.item', model: 'Items' },
        });
      if (!user || !user.bankkonto || !user.inventar) {
        await interaction.reply({
          content: 'Du hast kein Bankkonto!',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (user.bankkonto.currentMoney < price) {
        await interaction.reply({
          content: `Du hast nicht genug ${confCache.get(interaction.guild.id).get('MONEY_NAME')} auf deinem Bankkonto!`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (!itemName.includes('Keks')) {
        const item = await Items.findOne({ name: itemName });
        if (!item) {
          await interaction.reply({
            content: `Das Item ${itemName} existiert nicht!`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const itemIndex = user.inventar.items.findIndex((inventarItem) =>
          inventarItem.item.equals(item._id),
        );
        if (itemIndex !== -1) {
          user.inventar.items[itemIndex].quantity += 1;
          await user.inventar.save();
          await interaction.reply({
            content: `Du hast ein ${itemName} gekauft!`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          user.inventar.items.push({ item: item._id, quantity: 1 });
          await user.inventar.save();
          await interaction.reply({
            content: `Du hast ein ${itemName} gekauft!`,
            flags: MessageFlags.Ephemeral,
          });
        }
      } else {
        const booster = interaction.member.roles.cache.some(
          (role) => role.name === 'Server Booster',
        )
          ? true
          : false;
        let amount = price;
        if (booster) {
          amount = Math.floor((amount * 100) / 90);
        }
        const item = await Items.findOne({ name: 'Keks' });
        if (!item) {
          await interaction.reply({
            content: `Das Item Keks existiert nicht!`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        const itemIndex = user.inventar.items.findIndex((inventarItem) =>
          inventarItem.item.equals(item._id),
        );
        if (itemIndex !== -1) {
          user.inventar.items[itemIndex].quantity += amount;
        } else {
          user.inventar.items.push({ item: item._id, quantity: amount });
        }
        await user.inventar.save();
        const useButton = new ButtonBuilder()
          .setCustomId(`useItem_selectMenu_${itemName}`)
          .setLabel('Item benutzen')
          .setStyle('Primary');
        const firstRow = new ActionRowBuilder().addComponents(useButton);
        await interaction.reply({
          content: `Du hast ein ${itemName} gekauft!`,
          flags: MessageFlags.Ephemeral,
          components: [firstRow],
        });
      }
      await removeMoney(interaction.member, price);
      return;
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = shopButtons;

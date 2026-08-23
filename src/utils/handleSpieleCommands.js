const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const createShopEmbeds = require('../utils/createShopEmbeds.js');
const GameUser = require('../models/GameUser.js');
require('../models/Inventar.js');
require('../models/Items.js');
require('../models/Bankkonten.js');
require('../models/Tiere.js');
const Lottozahlen = require('../models/Lottozahlen.js');
const createAnimalsEmbeds = require('../utils/createAnimalsEmbeds.js');
const createSpieleLeaderboardEmbeds = require('../utils/createSpieleLeaderboardEmbeds.js');
const { confCache } = require('../utils/data/cache');

async function handleShop(interaction) {
  const embed = await createShopEmbeds(0, interaction);
  const pageDownButton = new ButtonBuilder()
    .setEmoji('⬅️')
    .setLabel('Zurück')
    .setStyle(ButtonStyle.Primary)
    .setCustomId(`shopDown`);

  const pageUpButton = new ButtonBuilder()
    .setEmoji('➡️')
    .setLabel('Vorwärts')
    .setStyle(ButtonStyle.Primary)
    .setCustomId(`shopUp`);

  const buyButton = new ButtonBuilder()
    .setEmoji('🛒')
    .setLabel('Kaufen')
    .setStyle(ButtonStyle.Success)
    .setCustomId(`shopBuy`);

  const firstRow = new ActionRowBuilder().addComponents(
    pageDownButton,
    pageUpButton,
  );
  const secondRow = new ActionRowBuilder().addComponents(buyButton);

  await interaction.editReply({
    embeds: [embed],
    components: [firstRow, secondRow],
  });
}

async function handleUseItem(interaction) {
  const targetUserObj = interaction.member;
  const user = await GameUser.findOne({ userId: targetUserObj.id }).populate({
    path: 'inventar',
    populate: { path: 'items.item', model: 'Items' },
  });
  if (!user || !user.inventar) {
    await interaction.reply({
      content: 'Du hast kein Inventar!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  let items = user.inventar.items;
  if (!items || items.length == 0) {
    await interaction.reply({
      content: 'Du besitzt keine items',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const itemSelectMenu = new StringSelectMenuBuilder()
    .setCustomId(`useItem_selectMenu`)
    .setPlaceholder('Wähle ein Item aus, das du benutzen möchtest.')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      items.map((item) => {
        const itemName = item.item.name;
        return {
          label: itemName,
          value: itemName,
        };
      }),
    );
  const row = new ActionRowBuilder().addComponents(itemSelectMenu);
  await interaction.reply({
    content: 'Wähle ein Item aus, das du benutzen möchtest:',
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleGamestats(interaction) {
  await interaction.deferReply();
  const targetUserId = interaction.member.id;
  const user = await GameUser.findOne({
    userId: targetUserId,
    guildId: interaction.guild.id,
  })
    .populate('bankkonto')
    .populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    })
    .populate('tiere');

  if (!user) {
    interaction.editReply('Du hast noch kein Level');
    return;
  }

  let allUsers = await GameUser.find({
    guildId: interaction.guild.id,
  }).populate('bankkonto');

  let oldUsers = [];
  for (let j = 0; j < allUsers.length; j++) {
    if (
      !interaction.guild.members.cache.find((m) => m.id === allUsers[j].userId)
        ?.id
    ) {
      oldUsers[oldUsers.length] = j;
    }
  }
  for (let j = 0; j < oldUsers.length; j++) {
    allUsers.splice(oldUsers[j] - j, 1);
  }

  allUsers.sort((a, b) => {
    return b.bankkonto.currentMoney - a.bankkonto.currentMoney;
  });
  let currentRank =
    allUsers.findIndex((usr) => usr.userId === targetUserId) + 1;
  let lotto = await Lottozahlen.find({
    guildId: interaction.guild.id,
    userId: targetUserId,
  });
  let lottospiele = 0;
  if (lotto && lotto.length > 0) {
    lottospiele = lotto.length;
  }
  const itemNamesAndQuantity = user.inventar.items
    .map((item, index) => {
      return `ID:${index} -> ${item.item.name} (x${item.quantity})`;
    })
    .join('\n');
  const tierpfade = user.tiere
    .map((tier) => {
      return `${tier.customName}`;
    })
    .join('\n');
  const messageEdited = new EmbedBuilder();
  messageEdited.setColor(0x0033cc);
  messageEdited.setAuthor({
    name: interaction.member.user.username,
    iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
  });
  messageEdited.setTitle(`Deine Stats:`);
  messageEdited.addFields({ name: 'Rang:', value: `${currentRank}` });
  messageEdited.addFields({
    name: `Aktuelle ${confCache.get(interaction.guild.id).get('MONEY_NAME')}:`,
    value: `${user.bankkonto.currentMoney}`,
  });
  messageEdited.addFields({
    name: `Erhaltene ${confCache.get(interaction.guild.id).get('MONEY_NAME')}:`,
    value: `${user.bankkonto.moneyGain}`,
  });
  messageEdited.addFields({
    name: `Verlorene/Ausgegebene ${confCache.get(interaction.guild.id).get('MONEY_NAME')}:`,
    value: `${user.bankkonto.moneyLost}`,
  });
  messageEdited.addFields({
    name: 'Anzahl Lottospiele:',
    value: `${lottospiele}`,
  });
  messageEdited.addFields({
    name: 'Quizfragen hinzugefügt:',
    value: `${user.quizadded}`,
  });
  messageEdited.addFields({
    name: 'Gewicht:',
    value: `${user.weight / 1000}kg`,
  });
  messageEdited.addFields({
    name: 'Inventar:',
    value: `${itemNamesAndQuantity}`,
  });
  messageEdited.addFields({ name: 'Tiere:', value: `${tierpfade}` });
  interaction.editReply({ embeds: [messageEdited] });
}

async function handleOwnAnimals(interaction) {
  const replyData = await createAnimalsEmbeds(
    0,
    interaction.guild.id,
    interaction.user.id,
  );
  if (!replyData) {
    interaction.editReply(`Du besitzt keine Tiere.`);
    return;
  }
  const pageDownButton = new ButtonBuilder()
    .setEmoji('⬅️')
    .setLabel('Zurück')
    .setStyle(ButtonStyle.Primary)
    .setCustomId(`ownAnimalsDown`);

  const pageUpButton = new ButtonBuilder()
    .setEmoji('➡️')
    .setLabel('Vorwärts')
    .setStyle(ButtonStyle.Primary)
    .setCustomId(`ownAnimalsUp`);

  const renameButton = new ButtonBuilder()
    .setEmoji('✏️')
    .setLabel('Umbenennen')
    .setStyle(ButtonStyle.Secondary)
    .setCustomId(`ownAnimalsRename`);

  const firstRow = new ActionRowBuilder().addComponents(
    pageDownButton,
    pageUpButton,
    renameButton,
  );

  await interaction.editReply({
    embeds: [replyData.embed],
    files: [replyData.file],
    components: [firstRow],
  });
}

async function handleKeksEssen(interaction) {
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Keks',
  );
  const quantity = user.inventar.items[itemId].quantity;
  const options = [{ label: '1', value: '1' }];
  if (quantity > 1) {
    options.push({ label: 'alle', value: `${quantity}` });
    if (quantity > 10) {
      options.push({ label: '10', value: '10' });
      if (quantity > 100) {
        options.push({ label: '100', value: '100' });
        if (quantity > 1000) {
          options.push({ label: '1000', value: '1000' });
          if (quantity > 10000) {
            options.push({ label: '10000', value: '10000' });
          }
        }
      }
    }
  }
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`useItem_keks_essen`)
    .setPlaceholder('Wie viele Kekse möchtest du essen?')
    .addOptions(options)
    .setMinValues(1)
    .setMaxValues(1);
  const row = new ActionRowBuilder().addComponents(selectMenu);
  await interaction.editReply({
    content: 'Wähle aus, wie viele Kekse du essen möchtest:',
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleLeaderboard(interaction) {
  const embed = await createSpieleLeaderboardEmbeds(0, interaction);
  const pageDownButton = new ButtonBuilder()
    .setEmoji('⬅️')
    .setLabel('Zurück')
    .setStyle(ButtonStyle.Primary)
    .setCustomId(`spieleLeaderDown`);

  const pageUpButton = new ButtonBuilder()
    .setEmoji('➡️')
    .setLabel('Vorwärts')
    .setStyle(ButtonStyle.Primary)
    .setCustomId(`spieleLeaderUp`);

  const firstRow = new ActionRowBuilder().addComponents(
    pageDownButton,
    pageUpButton,
  );

  interaction.editReply({
    embeds: [embed],
    components: [firstRow],
  });
}

module.exports = {
  handleShop,
  handleUseItem,
  handleGamestats,
  handleOwnAnimals,
  handleKeksEssen,
  handleLeaderboard,
};

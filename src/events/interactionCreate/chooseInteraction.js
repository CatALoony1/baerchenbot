const kummerkastenModal = require('../../utils/interactions/kummerkastenModal');
const leaderboardPage = require('../../utils/interactions/leaderboardPage');
const ownAnimalsButtons = require('../../utils/interactions/ownAnimalsButtons');
const quizAnswer = require('../../utils/interactions/quizAnswer');
const quizLeaderboardPage = require('../../utils/interactions/quizLeaderboardPage');
const quizModals = require('../../utils/interactions/quizModals');
const roleSelect = require('../../utils/interactions/roleSelect');
const selectMenuButton = require('../../utils/interactions/selectMenuButton');
const shopButtons = require('../../utils/interactions/shopButtons');
const spieleLeaderboardPage = require('../../utils/interactions/spieleLeaderboardPage');
const useItems = require('../../utils/interactions/useItems');

module.exports = {
  run: async (interaction, client) => {
    if (!interaction.customId) {
      return;
    }
    const customId = interaction.customId;
    console.log(
      `interaction ${customId} executed by ${interaction.member.user.tag}`,
    );
    if (customId.includes('useItem')) {
      await useItems(interaction, client);
    } else if (interaction.isModalSubmit()) {
      if (customId === `feedback-${interaction.user.id}`) {
        await kummerkastenModal(interaction);
      } else if (customId.includes('ownAnimals')) {
        await ownAnimalsButtons(interaction);
      } else if (customId.includes(`quizadd-${interaction.user.id}`)) {
        await quizModals(interaction);
      }
    } else if (interaction.isButton()) {
      if (customId.includes('lPage')) {
        leaderboardPage(interaction);
      } else if (customId.includes('ownAnimals')) {
        await ownAnimalsButtons(interaction);
      } else if (customId.includes('quiz')) {
        await quizAnswer(interaction);
      } else if (customId.includes('qPage')) {
        await quizLeaderboardPage(interaction, client);
      } else if (customId.includes('remove') && !customId.includes('_')) {
        await selectMenuButton(interaction);
      } else if (customId.includes('shop')) {
        await shopButtons(interaction);
      } else if (customId.includes('spieleLeader')) {
        await spieleLeaderboardPage(interaction);
      }
    } else if (interaction.isStringSelectMenu()) {
      if (customId.includes('select') && !customId.includes('_')) {
        await roleSelect(interaction);
      }
    }
  },
};

const Discord = require('discord.js');
const Question = require('../../models/QuizQuestion');
const giveMoney = require('../giveMoney');
const { confCache } = require('../data/cache');

async function quizModals(interaction) {
  await interaction.deferReply({ flags: Discord.MessageFlags.Ephemeral });
  const frage = interaction.fields.getTextInputValue('quizadd-frage');
  const richtig = interaction.fields.getTextInputValue('quizadd-richtig');
  const falsch1 = interaction.fields.getTextInputValue('quizadd-falsch1');
  const falsch2 = interaction.fields.getTextInputValue('quizadd-falsch2');
  const falsch3 = interaction.fields.getTextInputValue('quizadd-falsch3');
  const [, , mentionedUserId] = interaction.customId.split('-');
  const wrong = `${falsch1}/${falsch2}/${falsch3}`;
  const participants = [];
  participants[0] = mentionedUserId;
  const newQuestion = new Question({
    question: frage,
    right: richtig,
    wrong: wrong,
    participants: participants,
    guildId: interaction.guildId,
  });
  await newQuestion.save();
  const targetUserObj = await interaction.guild.members.fetch(mentionedUserId);
  if (
    confCache.get(interaction.guild.id) &&
    confCache.get(interaction.guild.id).get('MONEY_QUIZ_ADD') &&
    Number(confCache.get(interaction.guild.id).get('MONEY_QUIZ_ADD')) > 0
  ) {
    const moneyToGive = Number(
      confCache.get(interaction.guild.id).get('MONEY_QUIZ_ADD'),
    );
    await giveMoney(targetUserObj, moneyToGive, true);
  }
  interaction.editReply('Frage eingetragen!');
}

module.exports = quizModals;

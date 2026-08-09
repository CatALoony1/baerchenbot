const Discord = require('discord.js');
const Question = require('../../models/QuizQuestion');
const giveMoney = require('../giveMoney');

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
  const moneyToGive = 2000;
  await giveMoney(targetUserObj, moneyToGive, true);
  interaction.editReply('Frage eingetragen!');
}

module.exports = quizModals;

const { MessageFlags } = require('discord.js');
const Questions = require('../../models/QuizQuestion');
const QuizStats = require('../../models/QuizStats');
const giveMoney = require('../giveMoney');
const { confCache } = require('../data/cache');

function isYesterday(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === yesterday.getTime();
}

async function quizAnswer(interaction) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const [, rw, answer, id] = interaction.customId.split('_');
    const fetchedQuestion = await Questions.findOne({
      questionId: id,
    });
    if (fetchedQuestion) {
      const rightAnswerChar = fetchedQuestion.rightChar;
      if (fetchedQuestion.participants.includes(interaction.user.id)) {
        console.log('Quiz: tried to answer multiple times');
        await interaction.editReply(
          'Du hast die Frage bereits beantwortet oder die Frage eingereicht.',
        );
        return;
      } else {
        fetchedQuestion.participants.push(interaction.user.id);
      }
      if (answer == 'A') {
        fetchedQuestion.answerA += 1;
      } else if (answer == 'B') {
        fetchedQuestion.answerB += 1;
      } else if (answer == 'C') {
        fetchedQuestion.answerC += 1;
      } else {
        fetchedQuestion.answerD += 1;
      }
      await fetchedQuestion.save();
      const fetchedStats = await QuizStats.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      });
      if (rw === 'right') {
        let moneyToGive = 0;
        if (
          confCache.get(interaction.guild.id) &&
          confCache.get(interaction.guild.id).get('MONEY_QUIZ_RIGHT') &&
          Number(confCache.get(interaction.guild.id).get('MONEY_QUIZ_RIGHT')) >
            0
        ) {
          moneyToGive = Number(
            confCache.get(interaction.guild.id).get('MONEY_QUIZ_RIGHT'),
          );
        }
        if (fetchedStats) {
          fetchedStats.right += 1;
          if (isYesterday(fetchedStats.lastParticipation)) {
            fetchedStats.series += 1;
          } else {
            fetchedStats.series = 1;
          }
          if (moneyToGive > 0) {
            moneyToGive = Math.ceil(
              moneyToGive *
                (1 +
                  ((fetchedStats.series - 1) *
                    (Number(
                      confCache
                        .get(interaction.guild.id)
                        .get('MONEY_QUIZ_STREAK_PERC'),
                    ) || 0)) /
                    100),
            );
            await giveMoney(interaction.member, moneyToGive);
          }
          fetchedStats.lastParticipation = Date.now();
          await fetchedStats.save();
        } else {
          const newStats = new QuizStats({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            right: 1,
            series: 1,
            lastParticipation: Date.now(),
          });
          if (moneyToGive > 0) {
            await giveMoney(interaction.member, moneyToGive);
          }
          await newStats.save();
        }
        await interaction.editReply(
          `Glückwunsch, Antwort ${answer} ist richtig!🥳`,
        );
      } else if (rw === 'wrong') {
        if (fetchedStats) {
          fetchedStats.wrong += 1;
          fetchedStats.series = 0;
          fetchedStats.lastParticipation = Date.now();
          await fetchedStats.save();
        } else {
          const newStats = new QuizStats({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            wrong: 1,
            series: 0,
            lastParticipation: Date.now(),
          });
          await newStats.save();
        }
        await interaction.editReply(
          `Antwort ${answer} ist leider nicht richtig! Die richtige Antwort ist ${rightAnswerChar}`,
        );
      }
    } else {
      interaction.editReply(
        `Du kannst diese Frage nicht beantworten, da sie zu alt ist!`,
      );
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = quizAnswer;

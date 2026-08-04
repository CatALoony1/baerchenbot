const Discord = require('discord.js');
require('dotenv').config();
const cron = require('node-cron');
const Questions = require('../models/QuizQuestion');
const QuizStats = require('../models/QuizStats');

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let quizQuestionJob = null;

function startJob(client) {
  if (quizQuestionJob) {
    console.log('QuizQuestion-Job is already running.');
    return;
  }
  quizQuestionJob = cron.schedule('0 0 * * *', async function () {
    await jobFunction(client).catch((error) => {
      console.log(error);
    });
  });
  console.log('QuizQuestion-Job started.');
}

function stopJob() {
  if (quizQuestionJob) {
    quizQuestionJob.stop();
    quizQuestionJob = null;
    console.log('QuizQuestion-Job stopped.');
  } else {
    console.log('QuizQuestion-Job is not running.');
  }
}

function isRunning() {
  return quizQuestionJob !== null;
}

async function jobFunction(client) {
  console.log('Quiz started');
  const guilds = await client.guilds.cache;
  for (const guild of guilds) {
    try {
      const targetChannel = await client.channels.fetch(process.env.QUIZ_ID);
      const oldQuestions = await Questions.find({
        guildId: guild.id,
        asked: 'J',
      });
      if (oldQuestions.length != 0) {
        for (let i = 0; i < oldQuestions.length; i++) {
          let now = new Date();
          let diffTime = Math.abs(now - oldQuestions[i].started);
          let diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          if (diffHours < 25) {
            const oldQuestionEmbed = new Discord.EmbedBuilder();
            oldQuestionEmbed.setColor(0x868686);
            oldQuestionEmbed.setTitle(`Antwort des Vortages:`);
            oldQuestionEmbed.setDescription(
              `Die korrekte Antwort der vorherigen Frage war: ${oldQuestions[i].rightChar}\n${oldQuestions[i].right}`,
            );
            oldQuestionEmbed.addFields({
              name: `A`,
              value: `${oldQuestions[i].answerA} Stimmen`,
            });
            oldQuestionEmbed.addFields({
              name: `B`,
              value: `${oldQuestions[i].answerB} Stimmen`,
            });
            oldQuestionEmbed.addFields({
              name: `C`,
              value: `${oldQuestions[i].answerC} Stimmen`,
            });
            oldQuestionEmbed.addFields({
              name: `D`,
              value: `${oldQuestions[i].answerD} Stimmen`,
            });
            await targetChannel.send({ embeds: [oldQuestionEmbed] });
            break;
          }
        }
      }
      await Questions.deleteMany({
        asked: 'J',
      });

      const fetchedQuestions = await Questions.find({
        guildId: guild.id,
        asked: 'N',
      });
      if (fetchedQuestions.length != 0) {
        const questionIndex = getRandom(1, fetchedQuestions.length) - 1;
        const wrongAnswers = fetchedQuestions[questionIndex].wrong.split('/');
        let answers = [];
        const rightAnswerPosition = getRandom(1, 4) - 1;
        let count = 0;
        for (let i = 0; i < 4; i++) {
          if (i === rightAnswerPosition) {
            answers[i] = fetchedQuestions[questionIndex].right;
          } else {
            answers[i] = wrongAnswers[count];
            count += 1;
          }
        }
        const questionUser = fetchedQuestions[questionIndex].participants[0];
        const stats = await QuizStats.findOne({
          guildId: guild.id,
          userId: questionUser,
        });
        if (stats) {
          stats.lastParticipation = Date.now();
          await stats.save();
        }
        let rightChar = 'A';
        const questionEmbed = new Discord.EmbedBuilder();
        questionEmbed.setColor(0x0033cc);
        questionEmbed.setTitle(`Frage des Tages:`);
        questionEmbed.setDescription(
          `${fetchedQuestions[questionIndex].question}\n`,
        );
        questionEmbed.addFields({ name: `A`, value: `${answers[0]}` });
        questionEmbed.addFields({ name: `B`, value: `${answers[1]}` });
        questionEmbed.addFields({ name: `C`, value: `${answers[2]}` });
        questionEmbed.addFields({ name: `D`, value: `${answers[3]}` });
        const targetUserId = fetchedQuestions[questionIndex].participants[0];
        if (!guild.members.cache.find((m) => m.id === targetUserId)?.id) {
          console.log(`ERROR Quiz ${targetUserId} ist kein User`);
        } else {
          const targetUserObj = await guild.members.fetch(targetUserId);
          questionEmbed.setAuthor({
            name: targetUserObj.user.username,
            iconURL: targetUserObj.user.displayAvatarURL({ size: 256 }),
          });
        }
        const aButton = new Discord.ButtonBuilder()
          .setLabel('A')
          .setStyle(Discord.ButtonStyle.Primary);
        if (rightAnswerPosition === 0) {
          aButton.setCustomId(
            `quiz_right_A_${fetchedQuestions[questionIndex].questionId}`,
          );
          rightChar = 'A';
        } else {
          aButton.setCustomId(
            `quiz_wrong_A_${fetchedQuestions[questionIndex].questionId}`,
          );
        }
        const bButton = new Discord.ButtonBuilder()
          .setLabel('B')
          .setStyle(Discord.ButtonStyle.Primary);
        if (rightAnswerPosition === 1) {
          bButton.setCustomId(
            `quiz_right_B_${fetchedQuestions[questionIndex].questionId}`,
          );
          rightChar = 'B';
        } else {
          bButton.setCustomId(
            `quiz_wrong_B_${fetchedQuestions[questionIndex].questionId}`,
          );
        }
        const cButton = new Discord.ButtonBuilder()
          .setLabel('C')
          .setStyle(Discord.ButtonStyle.Primary);
        if (rightAnswerPosition === 2) {
          cButton.setCustomId(
            `quiz_right_C_${fetchedQuestions[questionIndex].questionId}`,
          );
          rightChar = 'C';
        } else {
          cButton.setCustomId(
            `quiz_wrong_C_${fetchedQuestions[questionIndex].questionId}`,
          );
        }
        const dButton = new Discord.ButtonBuilder()
          .setLabel('D')
          .setStyle(Discord.ButtonStyle.Primary);
        if (rightAnswerPosition === 3) {
          dButton.setCustomId(
            `quiz_right_D_${fetchedQuestions[questionIndex].questionId}`,
          );
          rightChar = 'D';
        } else {
          dButton.setCustomId(
            `quiz_wrong_D_${fetchedQuestions[questionIndex].questionId}`,
          );
        }
        const firstRow = new Discord.ActionRowBuilder().addComponents(
          aButton,
          bButton,
          cButton,
          dButton,
        );
        targetChannel.send({
          embeds: [questionEmbed],
          components: [firstRow],
        });

        const fetchedQuestion = await Questions.findOne({
          guildId: guild.id,
          questionId: fetchedQuestions[questionIndex].questionId,
        });
        fetchedQuestion.asked = 'J';
        fetchedQuestion.started = Date.now();
        fetchedQuestion.rightChar = rightChar;
        await fetchedQuestion.save().catch((e) => {
          console.log(`Error saving updated question ${e}`);
          return;
        });
      } else {
        targetChannel.send('Es gibt leider keine unbeantworteten Fragen.');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = {
  startJob,
  stopJob,
  isRunning,
  jobFunction,
};

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('confusion')
    .setDescription('Setzt Verwirrung ein.')
    .setContexts([InteractionContextType.Guild]),

  run: async ({ interaction }) => {
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    await interaction.deferReply();
    const reply = await interaction.editReply(
      `<@${interaction.user.id}> hat Verwirrung eingesetzt!`,
    );
    const randomNumber = getRandom(1, 4);
    if (randomNumber !== 1) {
      await timeoutUser(
        interaction.member,
        reply,
        `<@${interaction.user.id}> hat sich vor Verwirrung selbst verletzt und wurde für !timeoutDuration! Minuten stummgeschalten.`,
        `<@${interaction.user.id}> ist zu mächtig um verwirrt zu werden.`,
      );
    } else {
      const missedAttack = 3 === getRandom(1, 10);
      if (missedAttack) {
        await reply.reply(`Verwirrung schlug fehl!`);
      } else {
        const allUsers = await interaction.guild.members.fetch();
        const randomMember = allUsers.random();
        if (randomMember.user.bot) {
          const secondReply = await reply.reply(
            `Du hast versucht, <@${randomMember.user.id}> zu verwirren. Friedlyfire ist nicht aktiv.\n Aus Rache setzt <@${randomMember.user.id}> Spiegelcape ein.`,
          );
          await timeoutUser(
            interaction.member,
            secondReply,
            `Durch den Einsatz von Spiegelcape wurde <@${interaction.user.id}> verwirrt und hat sich selbst verletzt und wurde für !timeoutDuration! Minuten stummgeschalten.`,
            `<@${interaction.user.id}> ist immun gegen Spiegelcape.`,
          );
        } else {
          await timeoutUser(
            randomMember,
            reply,
            `<@${randomMember.user.id}> wurde von der Verwirrung getroffen und hat sich selbst verletzt und wurde für !timeoutDuration! Minuten stummgeschalten.`,
            `Ich traue mich nicht <@${randomMember.user.id}> zu verletzen.`,
          );
        }
      }
    }
  },
};

async function timeoutUser(member, reply, replyText, adminTimeoutText) {
  const timeoutDuration = getRandom(1, 5);
  try {
    await member.timeout(
      timeoutDuration * 60 * 1000,
      'Hat sich selbst verwirrt.',
    );
    await reply.reply(replyText.replace('!timeoutDuration!', timeoutDuration));
  } catch (error) {
    console.log('fehlende Berechtigung zum timeouten');
    await reply.reply(adminTimeoutText);
  }
}

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

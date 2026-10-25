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
    console.log(await interaction.guild.members.fetch());
    console.log('/n/n/n/n/n/n/n/n/n/n/n/n/n/n/n/n');
    console.log(await interaction.guild.members.list());

    await interaction.deferReply();
    const reply = await interaction.editReply(
      `<@${interaction.user.id}> hat Verwirrung eingesetzt!`,
    );
    const randomNumber = getRandom(1, 4);
    if (randomNumber !== 1) {
      const timeoutDuration = getRandom(1, 5);
      try {
        await interaction.member.timeout(
          timeoutDuration * 60 * 1000,
          'Hat sich selbst verwirrt.',
        );
        await reply.reply(
          `<@${interaction.user.id}> hat sich vor Verwirrung selbst verletzt und wurde für ${timeoutDuration} Minuten stummgeschalten.`,
        );
      } catch (error) {
        console.log('fehlende Berechtigung zum timeouten');
        await reply.reply(
          `<@${interaction.user.id}> ist zu mächtig um verwirrt zu werden.`,
        );
      }
    } else {
      const missedAttack = 3 === getRandom(1, 10);
      if (missedAttack) {
        await reply.reply(`Verwirrung schlug fehl!`);
      } else {
        //   const allUsers = interaction.guild.members.
      }
    }
  },
};

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const {
  SlashCommandBuilder, //zum erzeugen eines befehls
  InteractionContextType, //zum festlegen, wo der Befehl erlaubt ist
} = require('discord.js');

module.exports = {
  //erzeugen des Befehls
  data: new SlashCommandBuilder()
    .setName('confusion') //setzen des Namens (Dateiname und Befehl-Name parallöl halten)
    .setDescription('Setzt Verwirrung ein.')
    .setContexts([
      InteractionContextType.Guild, //Befehl auf Server erlaubt
    ]),

  run: async ({ interaction }) => {
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    await interaction.deferReply();
    const reply = await interaction.editReply(
      `<@${interaction.user.id}> hat Verwirrung eingesetzt!`,
    );
    const randomNumber = getRandom(1, 4);
    if (randomNumber === 1) {
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
      await reply.reply(`Baum`);
    }
  },
};

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

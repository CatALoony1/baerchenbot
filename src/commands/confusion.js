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
    await interaction.editReply(
      `<@${interaction.user.id}> hat Verwirrung eingesetzt!`,
    );
  },
};

const {
  SlashCommandBuilder,
  InteractionContextType,
  MessageFlags,
} = require('discord.js');
const getGif = require('../utils/getGif');
const wordList = require('../utils/wordList').wordList;

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Sendet ein zufälliges GIF zu einem Begriff.')
    .addStringOption((option) =>
      option
        .setName('suchwort')
        .setDescription('Suchwort, leer=random')
        .setMinLength(1)
        .setRequired(false),
    )
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction }) => {
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    await interaction.deferReply();
    let suchwort = interaction.options.get('suchwort').value;
    const regex =
      /^[\u0041-\u005A\u0061-\u007A\u00C4\u00D6\u00DC\u00E4\u00F6\u00FC\u00DF\s]+$/; // A-Z, a-z, ÄÖÜäöü, ß
    if (suchwort && !regex.test(suchwort)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await interaction.editReply(
        'Das übergebene Wort enthält Zeichen die nicht zugelassen sind.',
      );
      return;
    } else if (!suchwort) {
      suchwort = wordList[getRandom(0, wordList.length - 1)];
      console.log(`Kein Suchwort gesetzt. Zufälliges wird verwendet.`);
    }
    console.log(`Suchwort für GIF: ${suchwort}`);
    try {
      const response = await getGif(suchwort);
      await interaction.editReply(response);
    } catch (error) {
      console.log(error);
    }
  },
};

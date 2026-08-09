const {
  SlashCommandBuilder,
  InteractionContextType,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const Hangman = require('../models/Hangman');
const path = require('node:path');
const wordList = require('../utils/data/wordList').hangmanWordList;

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function unterstreicheSatz(satz) {
  const woerter = satz.split(' ');
  const unterstricheneWoerter = woerter.map((wort) => {
    return wort
      .split('')
      .map(() => '\\_')
      .join('');
  });
  return unterstricheneWoerter.join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Starte ein Spiel von Galgenmännchen.')
    .addStringOption((option) =>
      option
        .setName('wort')
        .setDescription('Wort mindestens 5 Buchstaben')
        .setMinLength(5)
        .setRequired(false),
    )
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction, client }) => {
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    try {
      await interaction.deferReply();
      let wortobj = interaction.options.get('wort');
      let wort = null;
      let user = interaction.user;
      if (!wortobj) {
        wort = wordList[getRandom(0, wordList.length - 1)];
        user = client.user;
      } else {
        wort = wortobj.value;
        const regex =
          /^[\u0041-\u005A\u0061-\u007A\u00C4\u00D6\u00DC\u00E4\u00F6\u00FC\u00DF\s]+$/; // A-Z, a-z, ÄÖÜäöü, ß
        if (!regex.test(wort)) {
          await interaction.editReply(
            'Das übergebene Wort enthält Zeichen die nicht zugelassen sind.',
          );
          return;
        }
      }
      const activeHangman = await Hangman.findOne({
        guildId: interaction.guild.id,
        status: 'laufend',
      });
      if (activeHangman) {
        await interaction.editReply(
          'Es läuft bereits ein Galgenmännchen Spiel. Bitte beende dies zuerst.',
        );
        return;
      }
      await Hangman.deleteMany({
        guildId: interaction.guild.id,
        status: 'beendet',
      });
      wort = wort.replaceAll('ß', 'ss').toUpperCase();
      let leerzeichen = unterstreicheSatz(wort);
      const file = new AttachmentBuilder(
        path.join(__dirname, '../../img/hangman0.png'),
      );
      const hangman = new EmbedBuilder()
        .setColor(0x0033cc)
        .setAuthor({
          name: user.username,
          iconURL: user.displayAvatarURL({ size: 256 }),
        })
        .setTitle(`Galgenmännchen`)
        .setDescription(
          `${leerzeichen}\n\n${wort.replaceAll(' ', '').length} Buchstaben`,
        )
        .setThumbnail(`attachment://hangman0.png`);
      const message = await interaction.editReply({
        embeds: [hangman],
        files: [file],
      });
      const hangmanData = new Hangman({
        authorId: user.id,
        guildId: interaction.guild.id,
        messageId: message.id,
        word: wort,
      });
      await hangmanData.save();
    } catch (error) {
      console.log(error);
    }
  },
};

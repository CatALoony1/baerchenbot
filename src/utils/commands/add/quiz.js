const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  LabelBuilder,
} = require('discord.js');

async function doQuizCommand(interaction) {
  try {
    const mentionedUserId = interaction.user.id;
    const modal = new ModalBuilder()
      .setTitle('Trage eine Frage ein.')
      .setCustomId(`quizadd-${interaction.user.id}-${mentionedUserId}`);
    const frageInput = new TextInputBuilder()
      .setCustomId('quizadd-frage')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(300);
    const frageInputLabel = new LabelBuilder()
      .setLabel('Frage:')
      .setTextInputComponent(frageInput);
    const richtigInput = new TextInputBuilder()
      .setCustomId('quizadd-richtig')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(100);
    const richtigInputLabel = new LabelBuilder()
      .setLabel('Richtige Antwort:')
      .setTextInputComponent(richtigInput);
    const falsch1Input = new TextInputBuilder()
      .setCustomId('quizadd-falsch1')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(100);
    const falsch1InputLabel = new LabelBuilder()
      .setLabel('Falsche Antwort 1:')
      .setTextInputComponent(falsch1Input);
    const falsch2Input = new TextInputBuilder()
      .setCustomId('quizadd-falsch2')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(100);
    const falsch2InputLabel = new LabelBuilder()
      .setLabel('Falsche Antwort 2:')
      .setTextInputComponent(falsch2Input);
    const falsch3Input = new TextInputBuilder()
      .setCustomId('quizadd-falsch3')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(100);
    const falsch3InputLabel = new LabelBuilder()
      .setLabel('Falsche Antwort 3:')
      .setTextInputComponent(falsch3Input);
    modal.addLabelComponents(
      frageInputLabel,
      richtigInputLabel,
      falsch1InputLabel,
      falsch2InputLabel,
      falsch3InputLabel,
    );
    await interaction.showModal(modal);
  } catch (err) {
    console.log(err);
  }
}

module.exports = doQuizCommand;

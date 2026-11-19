const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  LabelBuilder,
} = require('discord.js');

async function sendRuleSecretModal(interaction) {
  try {
    const modal = new ModalBuilder()
      .setTitle('Lösungswort eingeben')
      .setCustomId(`RuleSecretModal`);
    const textInput = new TextInputBuilder()
      .setCustomId('RuleSecretText')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(15);
    const textInputLabel = new LabelBuilder()
      .setLabel('Lösungswort:')
      .setTextInputComponent(textInput);
    modal.addLabelComponents(textInputLabel);
    await interaction.showModal(modal);
  } catch (err) {
    console.log(err);
  }
}

module.exports = sendRuleSecretModal;

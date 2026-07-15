async function doloescheCommand(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const amount = interaction.options.get('anzahl').value;
  if (!amount)
    return interaction.editReply({
      content: 'Du musst schon sagen wie viel ich löschen soll!',
    });
  if (isNaN(amount))
    return interaction.editReply({
      content: 'Es muss schon eine Zahl sein!',
    });
  if (amount > 100)
    return interaction.editReply({
      content: 'Mehr als 100 Nachrichten, das pack ich nicht.',
    });
  if (amount < 1)
    return interaction.editReply({
      content: '1 muss es doch schon mindestens sein',
    });

  try {
    const messages = await interaction.channel.messages.fetch({
      limit: amount,
    });
    const deletedMessages = await interaction.channel.bulkDelete(
      messages,
      true,
    );
    const actualNumer = deletedMessages.size;
    await interaction.editReply({
      content: `Ich habe mal ${actualNumer} Nachrichten gelöscht!`,
    });
  } catch (error) {
    console.log(error);
  }
}
module.exports = doloescheCommand;

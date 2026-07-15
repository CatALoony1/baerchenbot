async function doInformedInactiveCommand(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const targetUserId =
    interaction.options.get('nutzer')?.value ||
    interaction.options.get('user')?.value;
  const subcommand = interaction.options.getSubcommand();
  if (!interaction.guild.members.cache.find((m) => m.id === targetUserId)?.id) {
    interaction.editReply(
      `Bei ${targetUserId} handelt es sich nicht um einen Nutzer.`,
    );
    return;
  }
  const targetUserObj = await interaction.guild.members.fetch(targetUserId);
  const config = await Config.findOne({
    key: 'away',
    guildId: interaction.guild.id,
  });
  if (subcommand == 'informed-inactive-add') {
    if (config.value.includes(targetUserObj.user.tag)) {
      await interaction.editReply(
        `Der User ${targetUserObj.user.tag} ist bereits einetragen.`,
      );
    } else {
      if (config.value.length >= 1) {
        config.value = `${config.value},${targetUserObj.user.tag}`;
      } else {
        config.value = `${targetUserObj.user.tag}`;
      }
      await config.save();
      await interaction.editReply(
        `Der User ${targetUserObj.user.tag} wurde einetragen.`,
      );
    }
  } else if (subcommand == 'informed-inactive-remove') {
    if (config.value.includes(targetUserObj.user.tag)) {
      let away = config.value.split(',');
      away.splice(away.indexOf(targetUserObj.user.tag), 1);
      config.value = away.toString();
      await config.save();
      await interaction.editReply(
        `Der User ${targetUserObj.user.tag} wurde entfernt.`,
      );
    } else {
      await interaction.editReply(
        `Der User ${targetUserObj.user.tag} ist gar nicht einetragen.`,
      );
    }
  }
}

module.exports = doInformedInactiveCommand;

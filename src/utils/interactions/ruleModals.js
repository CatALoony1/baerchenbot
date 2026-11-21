const { MessageFlags } = require('discord.js');
const Config = require('../../models/Config');
const { serverConfCache } = require('../../utils/data/cache');

async function ruleModals(interaction) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const loesungswort = interaction.fields.getTextInputValue('RuleSecretText');
    const cfg = await Config.findOne({
      guildId: interaction.guildId,
      key: 'RULE_SECRET',
    });
    if (
      cfg &&
      cfg.value.trim().toLowerCase() === loesungswort.trim().toLowerCase()
    ) {
      if (
        serverConfCache.get(interaction.member.guild.id) &&
        serverConfCache
          .get(interaction.member.guild.id)
          .get('NEWMEMBER_ROLE_ID')
      ) {
        const role = interaction.member.guild.roles.cache.get(
          serverConfCache
            .get(interaction.member.guild.id)
            .get('NEWMEMBER_ROLE_ID'),
        );
        await interaction.member.roles.add(role);
      }
      await interaction.editReply(
        'Richtiges Lösungswort! Du hast nun Zugriff auf den Server.',
      );
    } else {
      await interaction.editReply(
        'Falsches Lösungswort! Bitte überprüfe die Regeln und versuche es erneut.',
      );
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = ruleModals;

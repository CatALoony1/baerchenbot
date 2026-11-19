const Config = require('../../models/Config');

const { ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');

async function sendRuleSecretButton(rulechannelId, client, guildId) {
  const guild = client.guilds.cache.get(guildId);
  const targetChannel =
    guild.channels.cache.get(rulechannelId) ||
    (await guild.channels.fetch(rulechannelId));
  if (targetChannel) {
    const cfg = await Config.findOne({
      guildId: guildId,
      key: 'RULE_SECRETBUTTON',
    });
    if (!cfg) {
      const newCfg = new Config({
        guildId: guildId,
        key: 'RULE_SECRETBUTTON',
        value: 'J',
      });
      await newCfg.save();
      const ruleSecretButton = new ButtonBuilder()
        .setLabel('Lösungswort eingeben')
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`RuleSecretButton`);
      const firstRow = new ActionRowBuilder().addComponents(ruleSecretButton);
      await targetChannel.send({
        components: [firstRow],
      });
    }
  }
}

module.exports = sendRuleSecretButton;

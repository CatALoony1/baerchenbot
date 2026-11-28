const { MessageFlags, EmbedBuilder } = require('discord.js');
const Config = require('../../models/Config');
const { serverConfCache, confCache } = require('../../utils/data/cache');
const getGifById = require('../getGifById');

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
      await sendWelcomeMessage(interaction.member);
    } else {
      await interaction.editReply(
        'Falsches Lösungswort! Bitte überprüfe die Regeln und versuche es erneut.',
      );
    }
  } catch (err) {
    console.log(err);
  }
}

async function sendWelcomeMessage(guildMember) {
  try {
    if (
      serverConfCache.get(guildMember.guild.id) &&
      serverConfCache.get(guildMember.guild.id).get('WELCOME_ID') &&
      ((confCache.get(guildMember.guild.id).get('WELCOME_HEADER') &&
        confCache.get(guildMember.guild.id).get('WELCOME_HEADER').length > 0) ||
        (confCache.get(guildMember.guild.id).get('WELCOME_GIF') &&
          confCache.get(guildMember.guild.id).get('WELCOME_GIF').length > 0) ||
        (confCache.get(guildMember.guild.id).get('WELCOME_TXT') &&
          confCache.get(guildMember.guild.id).get('WELCOME_TXT').length > 0))
    ) {
      const targetChannel =
        guildMember.guild.channels.cache.get(
          serverConfCache.get(guildMember.guild.id).get('WELCOME_ID'),
        ) ||
        (await guildMember.guild.channels.fetch(
          serverConfCache.get(guildMember.guild.id).get('WELCOME_ID'),
        ));
      if (!targetChannel) {
        console.log('Fehler, Willkommenschannel gibts nicht');
        return;
      }
      let gifUrl = null;
      if (
        confCache.get(guildMember.guild.id).get('WELCOME_GIF') &&
        confCache.get(guildMember.guild.id).get('WELCOME_GIF').trim().length > 0
      ) {
        const gifUrl = await getGifById(
          confCache.get(guildMember.guild.id).get('WELCOME_GIF'),
        );
        console.log(gifUrl);
        if (!gifUrl.includes('http')) {
          console.log('ERROR Welcome gif');
          console.log(gifUrl);
          gifUrl = null;
        }
      }
      let txt = confCache.get(guildMember.guild.id).get('WELCOME_TXT');
      let header = confCache.get(guildMember.guild.id).get('WELCOME_HEADER');
      let ping = confCache.get(guildMember.guild.id).get('WELCOME_PING');
      const members = await guildMember.guild.members.cache;
      const humanMemNum = members.filter((member) => !member.user.bot).size;
      const welcome = new EmbedBuilder().setColor(0x0033cc).setAuthor({
        name: guildMember.user.username,
        iconURL: guildMember.user.displayAvatarURL({ size: 256 }),
      });
      //.setFooter({
      //   text: `Nummer ${humanMemNum} in der ${guildMember.guild.name}`,
      //});
      if (header && header.trim().length > 0) {
        welcome.setTitle(
          header.replaceAll('[userPing]', `<@${guildMember.id}>`),
        );
      }
      if (txt && txt.trim().length > 0) {
        welcome.setDescription(
          txt.replaceAll('[userPing]', `<@${guildMember.id}>`),
        );
      }
      if (gifUrl) {
        console.log('test');
        welcome.setImage({ url: gifUrl });
      }
      console.log(welcome);
      let content = `<@${guildMember.id}>`;
      if (ping && ping.length > 0) {
        content = `<@&${ping}> ${content}`;
      }
      await targetChannel.send({
        content: content,
        embeds: [welcome],
      });
      await targetChannel.send({ content: gifUrl });
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = ruleModals;

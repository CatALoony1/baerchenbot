const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const Lottozahlen = require('../models/Lottozahlen');
const giveMoney = require('../utils/giveMoney');
const { confCache } = require('../utils/data/cache');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lotto')
    .setDescription('Tägliches Lottospiel.')
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction }) => {
    await interaction.deferReply();
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    const targetUserId = interaction.member.id;
    const targetUserObj = interaction.member;
    const latestLotto = await Lottozahlen.findOne({
      guildId: interaction.guild.id,
      userId: targetUserId,
    }).sort({ drawnTime: -1 });
    if (latestLotto) {
      const drawnTime = latestLotto.drawnTime;
      const heute = new Date();
      heute.setHours(0, 0, 0, 0);
      const drawnTimeDatum = new Date(drawnTime);
      drawnTimeDatum.setHours(0, 0, 0, 0);
      if (drawnTimeDatum.getTime() >= heute.getTime()) {
        interaction.editReply('Du darfst nur 1x täglich Lotto spielen!');
        return;
      }
    }
    const allLotto = await Lottozahlen.find({
      guildId: interaction.guild.id,
    });
    let lottozahl = -1;
    if (allLotto && allLotto.length > 0) {
      const lottozahlenArray = allLotto.map((dokument) => dokument.lottozahl);
      console.time('Lottozahlgenerierung');
      let counter = 0;
      do {
        lottozahl = Math.floor(Math.random() * 140000000);
        counter++;
      } while (lottozahlenArray.includes(lottozahl));
      console.timeEnd('Lottozahlgenerierung');
      console.log(
        `Lottozahl ${lottozahl} was generated after ${counter} tries`,
      );
    } else {
      lottozahl = Math.floor(Math.random() * 140000000);
    }
    let moneyToGive = 0;
    if (lottozahl != 0) {
      const newLottozahl = new Lottozahlen({
        guildId: interaction.guild.id,
        userId: targetUserId,
        drawnTime: new Date(),
        lottozahl: lottozahl,
      });
      await newLottozahl.save();
      let anzahlNullen = 0;
      if (lottozahl % 10000000 === 0) {
        moneyToGive = 200000;
        anzahlNullen = 7;
      } else if (lottozahl % 1000000 === 0) {
        moneyToGive = 75000;
        anzahlNullen = 6;
      } else if (lottozahl % 100000 === 0) {
        moneyToGive = 50000;
        anzahlNullen = 5;
      } else if (lottozahl % 10000 === 0) {
        moneyToGive = 25000;
        anzahlNullen = 4;
      } else if (lottozahl % 1000 === 0) {
        moneyToGive = 10000;
        anzahlNullen = 3;
      } else if (lottozahl % 100 === 0) {
        moneyToGive = 5000;
        anzahlNullen = 2;
      } else if (lottozahl % 10 === 0) {
        moneyToGive = 500;
        anzahlNullen = 1;
      } else {
        interaction.editReply(
          `Du hast diesmal leider nicht den Jackpot geknackt, deine Lottozahl war die ${lottozahl}`,
        );
        return;
      }
      if (anzahlNullen == 1) {
        interaction.editReply(
          `Du hast diesmal nicht den Jackpot geknackt, aber du hast eine Zahl die mit einer Null endet und erhälst somit ${moneyToGive} ${confCache.get(interaction.guild.id).get('MONEY_NAME')}. Deine Zahl war die ${lottozahl}`,
        );
      } else {
        interaction.editReply(
          `Du hast diesmal nicht den Jackpot geknackt, aber du hast eine Zahl die mit ${anzahlNullen} Nullen endet und erhälst somit ${moneyToGive} ${confCache.get(interaction.guild.id).get('MONEY_NAME')}. Deine Zahl war die ${lottozahl}`,
        );
      }
    } else {
      await Lottozahlen.deleteMany({ guildId: interaction.guild.id });
      interaction.editReply(
        `Glückwunsch <@${targetUserId}> du hast den Jackpot mit der Zahl ${lottozahl} geknackt und erhälst somit 1.000.000 XP`,
      );
      moneyToGive = 1000000;
      let lottoRole = interaction.guild.roles.cache.find(
        (role) => role.name === 'Lottogewinner',
      );
      await targetUserObj.roles.add(lottoRole);
      console.log(
        `Role Lottogewinner was given to user ${targetUserObj.user.tag}`,
      );
    }
    await giveMoney(targetUserObj, moneyToGive);
  },
};

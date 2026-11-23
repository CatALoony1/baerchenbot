const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  InteractionContextType,
  MessageFlags,
} = require('discord.js');
const Bump = require('../models/Bump');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('force-reminder')
    .setDescription('Erstellt den Bump Reminder')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),

  run: async ({ interaction }) => {
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const query = {
      guildId: interaction.guild.id,
    };
    try {
      const bumpEntry = await Bump.findOne(query);
      if (bumpEntry) {
        bumpEntry.endTime = Date.now() + 7200000;
        bumpEntry.reminded = 'N';
        await bumpEntry.save();
        await interaction.editReply(`Bump Reminder erstellt!`);
      } else {
        const newBump = new Bump({
          guildId: interaction.guild.id,
          endTime: Date.now() + 7200000,
        });
        await newBump.save();
        await interaction.editReply(`Bump Reminder erstellt!`);
      }
    } catch (error) {
      interaction.editReply('Fehler bei erstellen des Bump Reminders.');
      console.log(error);
    }
  },
};

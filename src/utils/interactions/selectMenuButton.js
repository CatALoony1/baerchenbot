const { MessageFlags } = require('discord.js');
const RoleSelectionRoles = require('../../models/RoleSelectionRoles');

async function selectMenuButton(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const selName = interaction.customId.split('_')[0];
  const guildId = interaction.guild.id;
  const selMenu = await RoleSelectionRoles.findOne({
    guildId: guildId,
    selectMenu: selName,
  });
  if (selMenu) {
    const roleArray = selMenu.roleIds;
    if (selMenu.multiSelect) {
      let removedRoles = [];
      for (let i = 0; i < roleArray.length; i++) {
        if (
          interaction.member.roles.cache.some(
            (role) => role.id === roleArray[i],
          )
        ) {
          let tempRole = interaction.guild.roles.cache.get(roleArray[i]);
          await interaction.guild.members.cache
            .get(interaction.member.id)
            .roles.remove(tempRole);
          console.log(
            `Role ${tempRole.name} (${roleArray[i]}) was removed from user ${interaction.member.user.tag}`,
          );
          removedRoles[removedRoles.length] = tempRole.name;
        }
      }
      if (removedRoles.length != 0) {
        await interaction.editReply(
          `Die Rollen ${removedRoles} wurde entfernt.`,
        );
      } else {
        await interaction.editReply(`Du hattest keine Rollen dieses Menüs.`);
      }
    } else {
      for (let i = 0; i < roleArray.length; i++) {
        if (
          interaction.member.roles.cache.some(
            (role) => role.id === roleArray[i],
          )
        ) {
          let tempRole = interaction.guild.roles.cache.get(roleArray[i]);
          await interaction.guild.members.cache
            .get(interaction.member.id)
            .roles.remove(tempRole);
          console.log(
            `Role ${tempRole.name} (${roleArray[i]}) was removed from user ${interaction.member.user.tag}`,
          );
          await interaction.editReply(
            `Die Rolle ${tempRole.name} wurde dir entzogen.`,
          );
          return;
        }
      }
      await interaction.editReply(`Du hattest keine Rollen dieses Menüs.`);
    }
  }
}

module.exports = selectMenuButton;

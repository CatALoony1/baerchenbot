const { MessageFlags } = require('discord.js');
const RoleSelectionRoles = require('../../models/RoleSelectionRoles');

async function roleSelect(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const selName = interaction.customId.split('_')[0];
  const guildId = interaction.guild.id;
  const selMenu = await RoleSelectionRoles.findOne({
    guildId: guildId,
    selectMenu: selName,
  });
  if (selMenu) {
    const roleArray = selMenu.roleIds;
    const member = interaction.guild.members.cache.get(interaction.member.id);
    const memberRoles = new Map(
      member.roles.cache.map((role) => [role.id, role]),
    );
    if (selMenu.multiSelect) {
      const rolesToAdd = interaction.values.filter(
        (roleId) => !memberRoles.has(roleId),
      );
      const rolesToRemove = roleArray.filter(
        (roleId) =>
          !interaction.values.includes(roleId) && memberRoles.has(roleId),
      );
      let replyMessage = '';
      if (rolesToAdd.length > 0) {
        await member.roles.add(rolesToAdd);
        replyMessage += `Die Rollen ${rolesToAdd.map((id) => memberRoles.get(id).name).join(', ')} wurde dir zugewiesen.\n`;
      }
      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove);
        replyMessage += `Die Rollen ${rolesToRemove.map((id) => memberRoles.get(id).name).join(', ')} wurde entfernt.`;
      }
      if (replyMessage === '') {
        replyMessage = 'Du besitzt bereits alle Rollen die du ausgewählt hast.';
      }
      await interaction.editReply(replyMessage);
    } else {
      const selectedRoleId = interaction.values[0];
      if (memberRoles.has(selectedRoleId)) {
        await interaction.editReply(
          `Du besitzt die Rolle ${memberRoles.get(selectedRoleId).name} bereits.`,
        );
        return;
      }
      const rolesToRemove = roleArray.filter((roleId) =>
        memberRoles.has(roleId),
      );
      await member.roles.add(selectedRoleId);
      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove);
      }
      await interaction.editReply(
        `Die Rolle ${memberRoles.get(selectedRoleId).name} wurde dir zugewiesen.`,
      );
    }
  }
}

module.exports = roleSelect;

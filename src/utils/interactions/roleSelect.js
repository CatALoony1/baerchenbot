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
      replyMessage += `Die Rolle/n ${rolesToAdd.map((id) => member.guild.roles.cache.get(id).name).join(', ')} wurde/n dir zugewiesen.\n`;
    }
    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove);
      replyMessage += `Die Rolle/n ${rolesToRemove.map((id) => memberRoles.get(id).name).join(', ')} wurde/n entfernt.`;
    }
    if (replyMessage === '') {
      replyMessage = 'Du besitzt bereits die Rolle/n die du ausgewählt hast.';
    }
    await interaction.editReply(replyMessage);
  }
}

module.exports = roleSelect;

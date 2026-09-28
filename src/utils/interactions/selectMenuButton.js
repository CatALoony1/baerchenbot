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
    const member = interaction.guild.members.cache.get(interaction.member.id);
    const memberRoles = new Map(
      member.roles.cache.map((role) => [role.id, role]),
    );
    const rolesToRemove = roleArray.filter((roleId) => memberRoles.has(roleId));
    if (rolesToRemove.length != 0) {
      await member.roles.remove(rolesToRemove);
      await interaction.editReply(
        `Die Rolle/n ${rolesToRemove.map((id) => memberRoles.get(id).name).join(', ')} wurde/n entfernt.`,
      );
    } else {
      await interaction.editReply(`Du hattest keine Rollen dieses Menüs.`);
    }
  }
}

module.exports = selectMenuButton;

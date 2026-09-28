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
    if (selMenu.multiSelect) {
      let removedRoles = [];
      let addedRoles = [];
      if (interaction.values.length == 0) {
        for (let i = 0; i < roleArray.length; i++) {
          if (
            interaction.member.roles.cache.some(
              (role) => role.id === roleArray[i],
            )
          ) {
            const tempRole = interaction.guild.roles.cache.get(roleArray[i]);
            await interaction.guild.members.cache
              .get(interaction.member.id)
              .roles.remove(tempRole);
            console.log(
              `Role ${tempRole.name} (${roleArray[i]}) was removed from user ${interaction.member.user.tag}`,
            );
            removedRoles[removedRoles.length] = tempRole.name;
          }
        }
      } else {
        for (let j = 0; j < roleArray.length; j++) {
          if (interaction.values.includes(roleArray[j])) {
            if (
              !interaction.member.roles.cache.some(
                (role) => role.id === roleArray[j],
              )
            ) {
              const role = interaction.guild.roles.cache.get(roleArray[j]);
              await interaction.guild.members.cache
                .get(interaction.member.id)
                .roles.add(role);
              console.log(
                `Role ${role.name} (${roleArray[j]}) was given to user ${interaction.member.user.tag}`,
              );
              addedRoles[addedRoles.length] = role.name;
            }
          } else if (
            interaction.member.roles.cache.some(
              (role) => role.id === roleArray[j],
            )
          ) {
            const tempRole = interaction.guild.roles.cache.get(roleArray[j]);
            await interaction.guild.members.cache
              .get(interaction.member.id)
              .roles.remove(tempRole);
            console.log(
              `Role ${tempRole.name} (${roleArray[j]}) was removed from user ${interaction.member.user.tag}`,
            );
            removedRoles[removedRoles.length] = roleArray[j];
          }
        }
      }
      if (addedRoles.length != 0 && removedRoles.length != 0) {
        await interaction.editReply(
          `Die Rollen ${addedRoles} wurde dir zugewiesen.\nDie Rollen ${removedRoles} wurde entfernt.`,
        );
      } else if (addedRoles.length != 0) {
        await interaction.editReply(
          `Die Rollen ${addedRoles} wurde dir zugewiesen.`,
        );
      } else if (removedRoles.length != 0) {
        await interaction.editReply(
          `Die Rollen ${removedRoles} wurde entfernt.`,
        );
      } else {
        await interaction.editReply(
          `Du besitzt alle Rollen die du ausgewählt hast.`,
        );
      }
    } else {
      if (
        interaction.member.roles.cache.some(
          (role) => role.id === interaction.values[0],
        )
      ) {
        const tempRole = interaction.guild.roles.cache.get(
          interaction.values[0],
        );
        await interaction.editReply(
          `Du besitzt die Rolle ${tempRole.name} bereits.`,
        );
        return;
      }
      for (let i = 0; i < roleArray.length; i++) {
        if (
          interaction.member.roles.cache.some(
            (role) => role.id === roleArray[i],
          )
        ) {
          const tempRole = interaction.guild.roles.cache.get(roleArray[i]);
          await interaction.guild.members.cache
            .get(interaction.member.id)
            .roles.remove(tempRole);
          console.log(
            `Role ${tempRole.name} (${roleArray[i]}) was removed from user ${interaction.member.user.tag}`,
          );
        }
      }
      const role = await interaction.guild.roles.cache.get(
        interaction.values[0],
      );
      console.log(role);
      await interaction.guild.members.cache
        .get(interaction.member.id)
        .roles.add(role);
      console.log(
        `Role ${role.name} (${interaction.values[0]}) was given to user ${interaction.member.user.tag}`,
      );
      await interaction.editReply(
        `Die Rolle ${role.name} wurde dir zugewiesen.`,
      );
    }
  }
}
module.exports = roleSelect;

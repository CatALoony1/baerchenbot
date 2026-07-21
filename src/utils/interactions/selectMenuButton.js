const { MessageFlags } = require('discord.js');

const {
  ageRoles,
  colorRoles,
  dmRoles,
  gameRoles,
  pingRoles,
  platformRoles,
  pronounRoles,
  regionRoles,
  countryRoles,
} = require('../selectMenuRoles');

async function selectMenuButton(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  let customId = interaction.customId;
  let variant = 0;
  let roleArray = [];
  switch (customId) {
    case 'removeAge':
      variant = 1;
      roleArray = ageRoles;
      break;
    case 'removeColor':
      variant = 1;
      roleArray = colorRoles;
      break;
    case 'removeDm':
      variant = 1;
      roleArray = dmRoles;
      break;
    case 'removeGames':
      variant = 2;
      roleArray = gameRoles;
      break;
    case 'removePingRoles':
      variant = 2;
      roleArray = pingRoles;
      break;
    case 'removePlatformRoles':
      variant = 2;
      roleArray = platformRoles;
      break;
    case 'removePronouns':
      variant = 2;
      roleArray = pronounRoles;
      break;
    case 'removeRegion':
      variant = 1;
      roleArray = regionRoles;
      break;
    case 'removeCountry':
      variant = 1;
      roleArray = countryRoles;
      break;
    default:
      console.log('Unknown customId');
      return;
  }
  if (variant == 1) {
    for (let i = 0; i < roleArray.length; i++) {
      if (
        interaction.member.roles.cache.some(
          (role) => role.name === roleArray[i],
        )
      ) {
        let tempRole = interaction.guild.roles.cache.find(
          (role) => role.name === roleArray[i],
        );
        await interaction.guild.members.cache
          .get(interaction.member.id)
          .roles.remove(tempRole);
        console.log(
          `Role ${roleArray[i]} was removed from user ${interaction.member.user.tag}`,
        );
        await interaction.editReply(
          `Die Rolle ${roleArray[i]} wurde dir entzogen.`,
        );
        return;
      }
    }
    await interaction.editReply(`Du hattest gar keine Altersrolle.`);
  } else if (variant == 2) {
    let removedRoles = [];
    for (let i = 0; i < roleArray.length; i++) {
      if (
        interaction.member.roles.cache.some(
          (role) => role.name === roleArray[i],
        )
      ) {
        let tempRole = interaction.guild.roles.cache.find(
          (role) => role.name === roleArray[i],
        );
        await interaction.guild.members.cache
          .get(interaction.member.id)
          .roles.remove(tempRole);
        console.log(
          `Role ${roleArray[i]} was removed from user ${interaction.member.user.tag}`,
        );
        removedRoles[removedRoles.length] = roleArray[i];
      }
    }
    if (removedRoles.length != 0) {
      await interaction.editReply(`Die Rollen ${removedRoles} wurde entfernt.`);
    } else {
      await interaction.editReply(`Du hattest gar keine Rollen dieses Menüs.`);
    }
  }
}

module.exports = selectMenuButton;

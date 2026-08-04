const { MessageFlags } = require('discord.js');
require('dotenv').config();

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
  hogwartsRoles,
} = require('../selectMenuRoles');

async function roleSelect(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  let customId = interaction.customId;
  let variant = 0;
  let roleArray = [];
  switch (customId) {
    case 'ageselect':
      variant = 1;
      roleArray = ageRoles;
      break;
    case 'colorselect':
      variant = 4;
      roleArray = colorRoles;
      break;
    case 'dmselect':
      variant = 2;
      roleArray = dmRoles;
      break;
    case 'gameselect':
      variant = 3;
      roleArray = gameRoles;
      break;
    case 'pingselect':
      variant = 3;
      roleArray = pingRoles;
      break;
    case 'platformselect':
      variant = 3;
      roleArray = platformRoles;
      break;
    case 'pronounselect':
      variant = 3;
      roleArray = pronounRoles;
      break;
    case 'regionselect':
      variant = 2;
      roleArray = regionRoles;
      break;
    case 'countryselect':
      variant = 2;
      roleArray = countryRoles;
      break;
    case 'hogwartselect':
      variant = 2;
      roleArray = hogwartsRoles;
      break;
    default:
      console.log('Unknown customId');
      return;
  }
  if (variant == 1) {
    if (interaction.values[0] === '<18') {
      const usertag = interaction.member.user.tag;
      await interaction.editReply(
        'Der Server ist ab 18, solltest du dich nicht verklickt haben und unter 18 sein würden wir dich bitten den Server zu verlassen.',
      );
      const targetChannel =
        interaction.guild.channels.cache.get(process.env.LOG_ID) ||
        (await interaction.guild.channels.fetch(process.env.LOG_ID));
      await targetChannel.send(
        `${usertag} ist unter 18.<@${process.env.ADMIN_ROLE_ID}>`,
      );
      return;
    } else {
      if (
        interaction.member.roles.cache.some(
          (role) => role.name === interaction.values[0],
        )
      ) {
        await interaction.editReply(
          `Du besitzt das Alter ${interaction.values[0]} bereits.`,
        );
        return;
      }
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
        }
      }
      const role = interaction.guild.roles.cache.find(
        (role) => role.name === interaction.values[0],
      );
      await interaction.guild.members.cache
        .get(interaction.member.id)
        .roles.add(role);
      console.log(
        `Role ${interaction.values[0]} was given to user ${interaction.member.user.tag}`,
      );
      await interaction.editReply(
        `Das Alter ${interaction.values[0]} wurde dir zugewiesen.`,
      );
    }
  } else if (variant == 2) {
    if (
      interaction.member.roles.cache.some(
        (role) => role.name === interaction.values[0],
      )
    ) {
      await interaction.editReply(
        `Du besitzt die Rolle ${interaction.values[0]} bereits.`,
      );
      return;
    }
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
      }
    }
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === interaction.values[0],
    );
    await interaction.guild.members.cache
      .get(interaction.member.id)
      .roles.add(role);
    console.log(
      `Role ${interaction.values[0]} was given to user ${interaction.member.user.tag}`,
    );
    await interaction.editReply(
      `Die Rolle ${interaction.values[0]} wurde dir zugewiesen.`,
    );
  } else if (variant == 3) {
    let removedRoles = [];
    let addedRoles = [];
    if (interaction.values.length == 0) {
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
    } else {
      for (let j = 0; j < roleArray.length; j++) {
        if (interaction.values.includes(roleArray[j])) {
          if (
            !interaction.member.roles.cache.some(
              (role) => role.name === roleArray[j],
            )
          ) {
            const role = interaction.guild.roles.cache.find(
              (role) => role.name === roleArray[j],
            );
            await interaction.guild.members.cache
              .get(interaction.member.id)
              .roles.add(role);
            console.log(
              `Role ${roleArray[j]} was given to user ${interaction.member.user.tag}`,
            );
            addedRoles[addedRoles.length] = roleArray[j];
          }
        } else if (
          interaction.member.roles.cache.some(
            (role) => role.name === roleArray[j],
          )
        ) {
          let tempRole = interaction.guild.roles.cache.find(
            (role) => role.name === roleArray[j],
          );
          await interaction.guild.members.cache
            .get(interaction.member.id)
            .roles.remove(tempRole);
          console.log(
            `Role ${roleArray[j]} was removed from user ${interaction.member.user.tag}`,
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
      await interaction.editReply(`Die Rollen ${removedRoles} wurde entfernt.`);
    } else {
      await interaction.editReply(
        `Du besitzt alle Rollen die du ausgewählt hast.`,
      );
    }
  } else if (variant == 4) {
    if (
      interaction.member.roles.cache.some(
        (role) => role.name === interaction.values[0],
      )
    ) {
      await interaction.editReply(
        `Du besitzt die Rolle ${interaction.values[0]} bereits.`,
      );
      return;
    }
    for (let i = 0; i < roleArray.length; i++) {
      if (interaction.member.roles.cache.has(roleArray[i])) {
        let tempRole = interaction.guild.roles.cache.get(roleArray[i]);
        await interaction.guild.members.cache
          .get(interaction.member.id)
          .roles.remove(tempRole);
        console.log(
          `Role ${tempRole.name} was removed from user ${interaction.member.user.tag}`,
        );
      }
    }
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === interaction.values[0],
    );
    await interaction.guild.members.cache
      .get(interaction.member.id)
      .roles.add(role);
    console.log(
      `Role ${interaction.values[0]} was given to user ${interaction.member.user.tag}`,
    );
    await interaction.editReply(
      `Die Rolle ${interaction.values[0]} wurde dir zugewiesen.`,
    );
  }
}
module.exports = roleSelect;

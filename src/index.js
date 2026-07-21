require('dotenv').config();
const Discord = require('discord.js');
const path = require('path');
const registerCommands = require('./utils/registerCommands');
const logToFile = require('./utils/logToFile');
const fs = require('node:fs');

const client = new Discord.Client({
  intents: [
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.GuildMessageReactions,
    Discord.IntentsBitField.Flags.MessageContent,
    Discord.IntentsBitField.Flags.GuildExpressions,
    Discord.IntentsBitField.Flags.GuildMembers,
    Discord.IntentsBitField.Flags.GuildModeration,
    Discord.IntentsBitField.Flags.GuildPresences,
    Discord.IntentsBitField.Flags.GuildVoiceStates,
    Discord.IntentsBitField.Flags.GuildWebhooks,
  ],
  partials: [
    Discord.Partials.Message,
    Discord.Partials.Channel,
    Discord.Partials.Reaction,
    Discord.Partials.User,
  ],
});
client.commands = new Discord.Collection();

(async () => {
  await logToFile.run(client);
  process.on('uncaughtException', (err) => {
    console.log(`FATAL UNCAUGHT EXCEPTION:`, err.stack || err);
    setTimeout(() => process.exit(1), 500);
  });

  process.on('unhandledRejection', (reason) => {
    console.log(`UNHANDLED PROMISE REJECTION:`, reason);
  });
  await registerCommands(process.env.GUILD_ID);
  const commandsPath = path.join(__dirname, 'commands');
  const getFiles = (dir) => {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory())
        files = [...files, ...getFiles(path.join(dir, item.name))];
      else if (item.name.endsWith('.js')) files.push(path.join(dir, item.name));
    }
    return files;
  };
  const commandFiles = getFiles(commandsPath);
  for (const filePath of commandFiles) {
    const command = require(filePath);
    if (command.data && command.run) {
      client.commands.set(command.data.name, command);
    }
  }
  const eventFiles = getFiles(path.join(__dirname, 'events'));
  for (const filePath of eventFiles) {
    const event = require(filePath);
    const eventName = event.name || path.basename(path.dirname(filePath));
    if (event.once) {
      client.once(eventName, (...args) => event.run(...args, client));
    } else {
      client.on(eventName, (...args) => event.run(...args, client));
    }
  }
  client.login(process.env.TOKEN);
})();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.run({ interaction, client });
  } catch (error) {
    console.error(error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply('Fehler beim Ausführen!');
    }
  }
});

client.login(process.env.TOKEN);

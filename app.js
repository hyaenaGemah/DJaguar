// Set up package requirements
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const repertoire = require('./repository/fileAccess');
const dao = require('./repository/dataAccess');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { generateDependencyReport } = require('@discordjs/voice');

// Set up queue (global variable)
global.queueResources = {
    queue: [],
    repeat: false,
    current: null
};

if (process.env.APP_DEBUG) {
    console.log(generateDependencyReport());
}

// Set up local repositories (files and database)
repertoire.initialize();
dao.initialize();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

// Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Login
client.login(process.env.APP_TOKEN);
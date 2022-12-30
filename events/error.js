const { Events } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: Events.Error,
    once: false,
    execute(client) {
        const connection = getVoiceConnection(interaction.guildId);
        connection.destroy();
    }
};
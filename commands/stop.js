const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder().setName("stop").setDescription("Stop the music."),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            interaction.reply("DJ is not currently in any VC. :leopard: :grey_question:");
            console.log("No voice chat to stop the music currently playing.");
            return;
        }

        if (!connection.state.subscription) {
            interaction.reply("DJ is not playing any music at the moment. :leopard: :grey_question:");
            console.log("No music currently playing to stop.");
            return;
        }

        connection.state.subscription.player.stop();
        interaction.reply("DJ is now idle. :leopard: :stop_button:");
        console.log("Music stopped.");
    }
};
const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder().setName("stop").setDescription("Stop the music and unqueue songs."),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            interaction.reply("DJ is not currently in any VC. :leopard: :grey_question:");
            utils.formattedLog("No voice chat to stop the music currently playing.");
            return;
        }

        if (!connection.state.subscription) {
            interaction.reply("DJ is not playing any music at the moment. :leopard: :grey_question:");
            utils.formattedLog("No music currently playing to stop.");
            return;
        }

        global.queueResources.queue = [];
        global.queueResources.current = null;
        connection.state.subscription.player.stop();
        interaction.reply("Songs unqueued. DJ is now idle. :leopard: :stop_button:");
        utils.formattedLog("Music stopped.");
    }
};
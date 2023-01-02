const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder().setName("pause").setDescription("Pauses/resumes currently playing music."),
    async execute(interaction) {
        await interaction.deferReply();
        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            interaction.editReply("DJ is not currently in any VC. :leopard: :grey_question:");
            utils.formattedLog("No voice chat to (un)pause music currently playing.");
            return;
        }

        if (!connection.state.subscription) {
            interaction.editReply("DJ is not playing any music at the moment. :leopard: :grey_question:");
            utils.formattedLog("No music currently playing to (un)pause.");
            return;
        }

        if (connection.state.subscription.player.state.status == AudioPlayerStatus.Playing) {
            connection.state.subscription.player.pause();
            interaction.editReply(":leopard: :pause_button:");
            utils.formattedLog("Song paused.");
        } else {
            connection.state.subscription.player.unpause();
            interaction.editReply(":leopard: :play_pause:");
            utils.formattedLog("Song resumed.");
        }
    }
};
const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder().setName("leave").setDescription("Leave a currently connected VC"),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            await interaction.reply("DJ is not currently in any VC. :leopard: :zzz:");
            utils.formattedLog("No voice chat to disconnect from.");
            return;
        }

        connection.destroy();
        await interaction.reply("DJ has left VC!");
    }
};
const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("poke").setDescription("Poke the DJ"),
    async execute(interaction) {
        utils.formattedLog('Poked.');
        await interaction.reply("Beep boop, meow~ :cd:~:musical_note: :leopard: :robot:");
    }
};
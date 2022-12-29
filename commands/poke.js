const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("poke").setDescription("Poke the DJ"),
    async execute(interaction) {
        await interaction.reply(":cd:~:musical_note: :leopard:");
    }
};
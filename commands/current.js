require('dotenv').config();
const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("current").setDescription("Get info about the song that is currently being played."),
    async execute(interaction) {
        interaction.reply(`Current song being played: ${global.queueResources.current.replace(process.env.APP_PATH_TO_MUSIC, '')}`);
    }
};
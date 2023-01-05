const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("repeat").setDescription("Toggle repeat"),
    async execute(interaction) {
        let replyMessage = "Repeat Toggle: ";

        if (global.queueResources.repeat) {
            global.queueResources.repeat = false;
            replyMessage += ":x:";
        } else {
            global.queueResources.repeat = true;
            replyMessage += ":repeat:";
        }

        await interaction.reply(replyMessage);
    }
};
const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("list").setDescription("Lists all songs queued."),
    async execute(interaction) {
        if (global.queueResources.queue.length === 0) {
            interaction.reply("There are no songs queued currently. :leopard: :mute:");
        }

        let queueInfo = "Queued songs:\n```";
        let currentlyPlaying = "None";

        for (let i = 0; i < global.queueResources.queue.length; i++) {
            const position = (global.queueResources.queue.indexOf(global.queueResources.queue[i]) + 1);
            const filename = global.queueResources.queue[i].replace(process.env.APP_PATH_TO_MUSIC, '');

            if (global.queueResources.queue[i] === global.queueResources.current) {
                currentlyPlaying = `**${global.queueResources.queue[i].replace(process.env.APP_PATH_TO_MUSIC, '')}**`
            }

            queueInfo += `#${position}: ${filename}\n`;
        }

        queueInfo += "```\nCurrently playing: " + currentlyPlaying;

        interaction.reply(queueInfo);
    }
};
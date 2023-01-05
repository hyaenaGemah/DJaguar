require('dotenv').config();
const path = require('node:path');
const dao = require('../repository/dataAccess');
const { SlashCommandBuilder } = require('discord.js');

const fullPathToMusic = path.resolve(process.env.APP_PATH_TO_MUSIC);

module.exports = {
    data: new SlashCommandBuilder().setName("list").setDescription("Lists all songs queued."),
    async execute(interaction) {
        if (global.queueResources.queue.length === 0) {
            await interaction.reply("There are no songs queued currently. :leopard: :mute:");
            return;
        }

        await interaction.reply("Collection queue data... :leopard: :thought_balloon:");
        const files = global.queueResources.queue.map(f => f.replace(path.resolve(process.env.APP_PATH_TO_MUSIC), '').substring(1));
        dao.listSongs(interaction.channel, files);
    }
};
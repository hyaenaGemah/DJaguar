const fs = require('node:fs');
const utils = require('../utils/utils');
const dao = require('../repository/dataAccess');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("all").setDescription("Lists all songs."),
    async execute(interaction) {
        const channel = interaction.channel;
        await interaction.reply("Getting all songs currently available...");
        await fs.readdir(process.env.APP_PATH_TO_MUSIC, (err, filenames) => {
            try {
                if (err) {
                    throw err;
                }

                dao.allSongs(channel, filenames);
            } catch (thrownErr) {
                channel.send("Uh-oh! The DJ had some trouble fetching the music! :leopard: :sweat_drops:");
                utils.formattedLog(`Failure listing all found files.\n${thrownErr}`);
            }
        });
    }
};
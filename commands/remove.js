require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const utils = require('../utils/utils');
const dao = require('../repository/dataAccess');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("remove")
        .setDescription("Remove a song from the repertoire (special role/admin")
        .addStringOption(opt => opt.setName("file").setDescription("Name of the file to be deleted.")),
    async execute(interaction) {
        let hasRole = false;
        interaction.member.roles.cache.map(r => r.name).forEach(name => {
            hasRole |= utils.validRoles(name);
        });

        if (!hasRole && interaction.member.id !== interaction.guild.ownerId) {
            await interaction.reply("Sorry but you can't do this. You need a proper role or to be the server's owner. :leopard: :x:");
            utils.formattedLog("Unauthorized deletion request.");
            return;
        }

        await interaction.reply("Removing file and metadata... the outcome will be posted soon. :leopard: :tm:");
        const channel = interaction.channel;
        let filename = interaction.options.getString("file");

        if (!filename.toLowerCase().endsWith(".mp3")) {
            filename += '.mp3';
        }

        const fullPath = path.join(path.resolve(process.env.APP_PATH_TO_MUSIC), filename);

        if (global.queueResources.current === fullPath) {
            channel.send("Cannot delete a song that's currently playing! :leopard: :grey_question:");
            utils.formattedLog("Cannot delete a song that's currently playing!");
            return;
        }

        if (!fs.existsSync(fullPath)) {
            channel.send("There's no file to be deleted somehow? :leopard: :grey_question:");
            utils.formattedLog("File to be deleted does not exist!");
            return;
        }

        fs.unlink(fullPath, (err) => {
            if (err) {
                utils.formattedLog(`Failure deleting the file! ${err}`);
                channel.send("Uh oh, the file couldn't be deleted. :leopard: :thinking_face:");
                return;
            }

            dao.deleteSong(channel, filename);
        });
    }
};
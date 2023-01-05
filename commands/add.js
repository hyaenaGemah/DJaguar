require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const https = require('https');
const utils = require('../utils/utils');
const dao = require('../repository/dataAccess');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("add")
        .setDescription("Add a song to the repertoire (need special role/admin).")
        .addAttachmentOption(opt => opt.setName("file").setDescription("MP3 file to be added.").setRequired(true))
        .addStringOption(opt => opt.setName("title").setDescription("Song title.").setRequired(true))
        .addStringOption(opt => opt.setName("album").setDescription("Song album.").setRequired(true))
        .addStringOption(opt => opt.setName("artist").setDescription("Song artist.").setRequired(true))
        .addStringOption(opt => opt.setName("tags").setDescription("Tags separated by comma and no spaces.")),
    async execute(interaction) {
        let hasRole = false;
        interaction.member.roles.cache.map(r => r.name).forEach(name => {
            hasRole |= utils.validRoles(name);
        });

        if (!hasRole && interaction.member.id !== interaction.guild.ownerId) {
            await interaction.reply("Sorry but you can't do this. You need a proper role or to be the server's owner. :leopard: :x:");
            return;
        }

        await interaction.reply("Adding file, please wait a little. :leopard: :gear:");
        const channel = interaction.channel;
        const attachmentUrl = interaction.options.getAttachment("file").url;
        const metadata = JSON.stringify({
            title: interaction.options.getString("title"),
            album: interaction.options.getString("album"),
            artist: interaction.options.getString("artist")
        });
        const tags = interaction.options.getString("tags")?.trim()?.replaceAll(' ', '_');

        //Download attachment
        const filename = utils.last(attachmentUrl.split('/'));

        if (!filename.toLowerCase().endsWith(".mp3")) {
            channel.send("This is not a music file. Try again! :leopard: :mute:");
            utils.formattedLog("Unauthorized upload request.");
            return;
        }

        https.get(attachmentUrl, (response) => {
            try {
                const filePath = path.join(path.resolve(process.env.APP_PATH_TO_MUSIC), filename);
                const fileStream = fs.createWriteStream(filePath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    utils.formattedLog(`Finished downloading: ${attachmentUrl}`);
                    channel.send("Finished saving the file, now to deal with the other data... :leopard: :thought_balloon:");

                    // Add DB entry with tags and metadata
                    dao.addSong(filename, metadata, tags, channel);
                });
            } catch (error) {
                utils.formattedLog(`Failed downloading: ${attachmentUrl} - Reason: ${error}`);
                channel.send("Uh oh, couldn't download the song. PLease try again. :leopard: :sweat_drops:");
            }
        });
    }
};
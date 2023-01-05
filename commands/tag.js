require('dotenv').config();
const utils = require('../utils/utils');
const path = require('node:path');
const dao = require('../repository/dataAccess');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("tag")
        .setDescription("Get, include or delete tags from songs.")
        .addIntegerOption(opt => opt.setName("change")
            .setDescription("Whether there will be changes, and type.")
            .setChoices({ name: "Check", value: 0 }, { name: "Add", value: 1 }, { name: "Remove", value: 2 })
            .setRequired(true))
        .addStringOption(opt => opt.setName("name").setDescription("The tag names, separated by commas"))
        .addStringOption(opt => opt.setName("file").setDescription("The file which tag will be managed")),
    async execute(interaction) {
        const channel = interaction.channel;
        const tagName = interaction.options.getString("name")?.trim()?.replace(' ', '_');
        const fileOption = interaction.options.getString("file");
        const file = fileOption ?? global.queueResources.current.replace(path.resolve(process.env.APP_PATH_TO_MUSIC), '').substring(1);

        if (!file) {
            utils.formattedLog("File for tag management was not informed.");
            interaction.reply("Can't find the song which tags are to manage. :leopard: :question:");
            return;
        }

        const option = interaction.options.getInteger("change");

        if (option && !tagName) {
            utils.formattedLog("Tag name was not informed.");
            interaction.reply("Tag name was not informed. :leopard: :x:");
            return;
        }

        let message;
        let callback = null;

        switch (option) {
            case 1: // Add tag
                message = "Adding tag(s) to the song...";
                callback = dao.addTags;
                break;
            case 2: // Remove tag
                message = "Removing tag(s) to the song...";
                callback = dao.removeTags;
                break;
            default: // Default case - return the tags
                message = "Getting the tag(s) for the song...";
        }

        interaction.reply(message);
        dao.checkTags(file, channel, tagName, callback);

    }
};
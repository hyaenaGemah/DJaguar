const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("unqueue")
        .setDescription("Remove a song from the queue")
        .addIntegerOption(opt => opt.setName("song")
            .setDescription("The song to be removed from the queue")
            .setRequired(true)),
    async execute(interaction) {
        let position = interaction.options.getInteger("song");

        if (!position) {
            await interaction.reply("I can't find this song in the queue. :leopard: :interrobang:");
            utils.formattedLog(`Could not find song in position #${position} in the queue.`);
            return;
        }

        position -= 1;
        const currentSongPosition = global.queueResources.queue.indexOf(global.queueResources.current);
        const currentSongName = global.queueResources.current;

        if (position === currentSongPosition && position !== 0) {
            global.queueResources.current = global.queueResources.queue[position - 1];
        }
        else if (position === currentSongPosition && position === 0) {
            global.queueResources.current = global.queueResources.queue[global.queueResources.queue.length - 1];
        }

        global.queueResources.queue.splice(position, 1);
        await interaction.reply("Song removed from the queue! :leopard: :+1:");
        utils.formattedLog(`Removed song: ${currentSongName} from the queue.`);
    }
};
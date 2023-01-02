const utils = require('../utils/utils');
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder().setName("join").setDescription("Join any VC available."),
    async execute(interaction) {
        try {
            const currMember = interaction.member;
            const voiceChannel = currMember.voice.channel;

            if (!voiceChannel) {
                interaction.reply("DJ can only join a VC if the requesting user is in one. :leopard: :anger:");
                utils.formattedLog("Could not find Voice Channel to join");
                return;
            }

            const vc = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });

            vc.on('stateChange', (oldState, newState) => {
                utils.formattedLog(`Connection transitioned from ${oldState.status} to ${newState.status}`);
            });

            await interaction.reply('DJ has joined VC!');
        } catch (err) {
            interaction.reply("Uh-oh! The DJ had some trouble joining VC! :leopard: :sweat_drops:");
            utils.formattedLog("Failure joining a Voice Channel.\n" + err);
        }
    }
};
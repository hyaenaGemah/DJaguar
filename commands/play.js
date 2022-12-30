require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

const audioPlayerObserver = function (audioPlayer) {
    audioPlayer.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
    });
    audioPlayer.on(AudioPlayerStatus.Paused, () => {
        console.log('The audio player has been paused!');
    });
    audioPlayer.on(AudioPlayerStatus.AutoPaused, () => {
        console.log('The audio player has paused automatically!');
    });
    audioPlayer.on(AudioPlayerStatus.Buffering, () => {
        console.log('The audio player is buffering...');
    });
    audioPlayer.on(AudioPlayerStatus.Idle, () => {
        console.log('The audio player is idle.');
    });
};

module.exports = {
    data: new SlashCommandBuilder().setName("play")
        .setDescription("Play any available music.")
        .addStringOption(opt => opt.setName("song").setDescription("Filename of the song to play.")),
    async execute(interaction) {
        await interaction.deferReply();
        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            interaction.editReply("DJ is not currently in any VC. :leopard: :grey_question:");
            console.log("No voice chat to play music in.");
            return;
        }

        const filename = interaction.options.getString("song");
        const fullFilePath = path.join(process.env.APP_PATH_TO_MUSIC, (filename.includes(".mp3") ? filename : `${filename}.mp3`));
        const fileExists = fs.existsSync(fullFilePath);

        if (!fileExists) {
            interaction.editReply("DJ could not find the song to play. :leopard: :grey_question:");
            console.log("Music file not found.");
            return;
        }

        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            }
        });
        const audioResource = createAudioResource(fullFilePath);
        audioPlayerObserver(audioPlayer);
        audioPlayer.play(audioResource);
        const subscription = connection.subscribe(audioPlayer);

        if (!subscription) {
            setTimeout(() => subscription.unsubscribe(), 3000);
        }

        interaction.editReply(`Playing: ${filename.includes(".mp3") ? filename : filename + '.mp3'} :leopard: :arrow_forward: :musical_note:`);
    }
};
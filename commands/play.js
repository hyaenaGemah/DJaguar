require('dotenv').config();
const utils = require('../utils/utils');
const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

const audioPlayerObserver = function (audioPlayer) {
    audioPlayer.on(AudioPlayerStatus.Playing, () => {
        utils.formattedLog('The audio player has started playing!');
    });

    audioPlayer.on(AudioPlayerStatus.Paused, () => {
        utils.formattedLog('The audio player has been paused!');
    });

    audioPlayer.on(AudioPlayerStatus.AutoPaused, () => {
        utils.formattedLog('The audio player has paused automatically!');
    });

    audioPlayer.on(AudioPlayerStatus.Buffering, () => {
        utils.formattedLog('The audio player is buffering...');
    });

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
        utils.formattedLog('The audio player is idle.');

        if (global.queueResources.queue.length > 1 || global.queueResources.repeat) {
            const next = utils.nextSong();

            if (next) {
                const audioResource = createAudioResource(next);
                audioPlayer.play(audioResource);
                utils.formattedLog(`Playing next on the queue - Position #${global.queueResources.queue.indexOf(next) + 1} : ${next}`);
            } else {
                utils.formattedLog("Finished queue.");
            }
        } else {
            utils.formattedLog("Finished queue.");
        }
    });
};

module.exports = {
    data: new SlashCommandBuilder().setName("play")
        .setDescription("Play/Queue any available music.")
        .addStringOption(opt => opt.setName("song").setDescription("Filename of the song to play."))
        .addBooleanOption(opt => opt.setName("now").setDescription("Prepend and play the song, restarting the queue."))
        .addBooleanOption(opt => opt.setName("replay").setDescription("Replays queue from the beginning")),
    async execute(interaction) {
        await interaction.deferReply();
        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            interaction.editReply("DJ is not currently in any VC. :leopard: :grey_question:");
            utils.formattedLog("No voice chat to play music in.");
            return;
        }

        let filename = interaction.options.getString("song");
        const replay = interaction.options.getBoolean("replay");

        if (replay) {
            filename = global.queueResources.queue[0].replace(process.env.APP_PATH_TO_MUSIC, '');
        }

        if (!filename) {
            interaction.editReply("DJ could not find the song to play. :leopard: :grey_question:");
            utils.formattedLog(`No music file informed to play.`);
            return;
        }

        const actualFilename = filename.includes(".mp3") ? filename : filename + '.mp3';
        const fullFilePath = path.join(process.env.APP_PATH_TO_MUSIC, (filename.includes(".mp3") ? filename : `${filename}.mp3`));
        const fileExists = fs.existsSync(fullFilePath);

        if (!fileExists) {
            interaction.editReply("DJ could not find the song to play. :leopard: :grey_question:");
            utils.formattedLog(`Music file: ${fullFilePath} - not found.`);
            return;
        }

        if (global.queueResources.current === null) {
            global.queueResources.current = fullFilePath;
        }

        if (interaction.options.getBoolean("now")) {
            global.queueResources.queue.unshift(fullFilePath);
            global.queueResources.current = fullFilePath;
        } else if (!replay) {
            global.queueResources.queue.push(fullFilePath);

            if (global.queueResources.queue.length > 1) {
                interaction.editReply(`Queued song file: ${actualFilename} :leopard: :arrow_forward: :clock3:`);
                return;
            }
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

        interaction.editReply(`Playing: ${actualFilename} :leopard: :arrow_forward: :musical_note:`);
        utils.formattedLog(`Playing - Position #${global.queueResources.queue.indexOf(fullFilePath) + 1} : ${fullFilePath}`);
    }
};
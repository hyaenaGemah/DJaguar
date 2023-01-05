require('dotenv').config();
const utils = require('../utils/utils');
const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3');
const { exit } = require('node:process');
const { channel } = require('node:diagnostics_channel');

let db = null;

module.exports = {
    initialize: function () {
        const pathToDb = path.resolve(process.env.APP_PATH_TO_DB);

        if (!fs.existsSync(pathToDb)) {
            const fileOpen = fs.openSync(pathToDb, 'w');

            if (!fileOpen) {
                utils.formattedLog("Failure creating embbeded database file!");
                exit(1);
            }

            utils.formattedLog(`Embbeded database file created.`);
        }

        db = new sqlite3.Database(pathToDb, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                utils.formattedLog(`Failed to connect to database: ${err}`);
                exit(1);
            }

            const createTableQuery = `CREATE TABLE IF NOT EXISTS music_repo (
                file TEXT PRIMARY KEY,
                metadata TEXT,
                tags TEXT
            );`;

            db.run(createTableQuery, (err) => {
                if (err) {
                    utils.formattedLog(`Failed to create music repository table: ${err}`);
                    exit(1);
                }

                const foundFiles = fs.readdirSync(process.env.APP_PATH_TO_MUSIC);

                db.run(`DELETE FROM music_repo WHERE file NOT IN ('${foundFiles.join("','")}')`, (err) => {
                    if (err) {
                        utils.formattedLog(`Failure performing table clean up: ${err}`);
                    }

                    db.get(`SELECT COUNT(*) AS found FROM music_repo;`, (err, result) => {
                        if (err) {
                            utils.formattedLog(`Could not count entries in the repository!`);
                        }

                        utils.formattedLog(`Found ${result.found} entries in the music repository.`);
                    });
                });
            });
        });
    },
    addSong: function (filename, metadata, tags, discordChannel) {
        db.run(`INSERT INTO music_repo (file, metadata, tags) VALUES (?, ?, ?)`, [filename, metadata, tags], (err) => {
            if (err) {
                discordChannel.send("Uh oh, I could save the file, but failed to put everything in order. :leopard: :desktop_computer: :no_entry_sign:")
                utils.formattedLog(`Failure adding entry for ${filename}:\n\tmetadata: ${metadata}\n\ttags:${tags}\nReason: ${err}`);
                return;
            }

            discordChannel.send("Everything done! Song added to the *repertoire*~ :leopard: :cd: :sparkles:");
        });
    },
    getSongs: function (tag, callback) {
        const escapedTag = tag.replaceAll(' ', '').replaceAll(',', '');
        db.all(`SELECT file FROM music_repo WHERE tags LIKE '%${escapedTag}%'`, [], (err, rows) => {
            if (err) {
                utils.formattedLog(`Failure getting songs with tag: "${tag}: ${err}"`);
                return;
            }

            const songs = rows.map(song => path.join(path.resolve(process.env.APP_PATH_TO_MUSIC), song.file));

            if (songs.length) {
                callback(songs);
            }
        });
    },
    listSongs: function (channel, files) {
        db.all(`SELECT file, metadata FROM music_repo WHERE file IN ('${files.join("','")}')`, [], (err, rows) => {
            if (err) {
                utils.formattedLog(`Could not get metadata from queued files: ${err}`);
                channel.send("Uh oh, can't get the songs metadata. :leopard: :sweat_drops:");
                return;
            }

            const fileDetails = new Map();
            rows.forEach(r => fileDetails.set(r.file, JSON.parse(r.metadata)));

            let queueInfo = "Queued songs:\n```";
            let currentlyPlaying = "None";

            for (let i = 0; i < global.queueResources.queue.length; i++) {
                const position = (global.queueResources.queue.indexOf(global.queueResources.queue[i]) + 1);
                const filename = global.queueResources.queue[i].replace(path.resolve(process.env.APP_PATH_TO_MUSIC), '').substring(1);
                const title = fileDetails.get(filename)?.title ?? "N/A";
                const album = fileDetails.get(filename)?.album ?? "N/A";
                const artist = fileDetails.get(filename)?.artist ?? "N/A";

                if (global.queueResources.queue[i] === global.queueResources.current) {
                    currentlyPlaying = `#${position}: ${album} - ${title}, by: ${artist} (\`${filename}\`)\n`;
                }

                queueInfo += `#${position}: ${album} - ${title} - Artist: ${artist} (${filename})\n`;
            }

            queueInfo += "```\nCurrently playing: " + currentlyPlaying;
            channel.send(queueInfo);
        });
    },
    allSongs: function (channel, files) {
        db.all("SELECT file, metadata FROM music_repo", [], (err, rows) => {
            if (err) {
                utils.formattedLog(`Could not get metadata from available files: ${err}`);
                channel.send("Uh oh, can't get the songs metadata. :leopard: :sweat_drops:");
                return;
            }

            const fileDetails = new Map();
            rows.forEach(r => fileDetails.set(r.file, JSON.parse(r.metadata)));

            let info = "Queued songs:\n```";

            for (let i = 0; i < files.length; i++) {
                const title = fileDetails.get(files[i])?.title ?? "N/A";
                const album = fileDetails.get(files[i])?.album ?? "N/A";
                const artist = fileDetails.get(files[i])?.artist ?? "N/A";
                info += `#${i + 1}: ${album} - ${title} - Artist: ${artist} (${files[i]})\n`;
            }

            info += "```";
            channel.send(info);
        })
    },
    deleteSong: function (channel, filename) {
        db.run("DELETE FROM music_repo WHERE file = ?", [filename], (err) => {
            if (err) {
                utils.formattedLog(`Failure removing song metadata! ${err}`);
                channel.send(`Song was deleted successfully, but metadata couldn't be removed. I'll attempt again next start-up. :leopard: :timer_clock:`);
                return;
            }

            utils.formattedLog("Song fully deleted!");
            channel.send(`Song deleted successfully! See you later space cowboy... :leopard: :smiling_face_with_tear:`);
        });
    },
    checkTags: async function (file, channel, tagToChange, callback) {
        db.all("SELECT tags FROM music_repo WHERE file = ?", [file], (err, rows) => {
            if (err) {
                utils.formattedLog(`Failure getting song tags! ${err}`);
                channel.send("Uh oh, could not get the tags to process the request. :leopard: :thought_balloon:");
                return;
            }

            const tags = rows[0]?.tags

            if (!callback) {
                channel.send(`These are the tags found: \`${(tags?.replaceAll(',', ', ') ?? "None")}\``);
                return;
            }

            callback(file, channel, tags, tagToChange);
        });
    },
    addTags: function (file, channel, tags, tagToChange) {
        const tagsToUpdate = tags ? `${tags},${tagToChange}` : tagToChange;
        db.run(`UPDATE music_repo SET tags = ? WHERE file = ?`, [tagsToUpdate, file], (err) => {
            if (err) {
                utils.formattedLog(`Failure adding song tags! ${err}`);
                channel.send("Failed adding tag(s). :leopard: :heavy_plus_sign: :x:");
            }

            channel.send("Tag added with success! :leopard: :heavy_plus_sign:");
        });
    },
    removeTags: function (file, channel, tags, tagToChange) {
        const tagsToRemove = tagToChange.split(',');
        let tagsToUpdate = tags;

        for (let i = 0; i < tagsToRemove.length; i++) {
            if (tagsToRemove[i]) {
                tagsToUpdate = tagsToUpdate.replace(`,${tagsToRemove[i]}`, '').replace(`${tagsToRemove[i]},`, '').replace(tagsToRemove[i], '');
            }
        }

        db.run(`UPDATE music_repo SET tags = ? WHERE file = ?`, [tagsToUpdate, file], (err) => {
            if (err) {
                utils.formattedLog(`Failure removing song tags! ${err}`);
                channel.send("Failed removing the tag(s). :leopard: :heavy_minus_sign: :x:");
            }

            channel.send("Tag(s) removed with success! :leopard: :heavy_minus_sign:");
        });
    }
};
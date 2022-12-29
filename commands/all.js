
const fs = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("all").setDescription("Lists all songs."),
    async execute(interaction) {
        await interaction.deferReply();
        await fs.readdir(process.env.APP_PATH_TO_MUSIC, (err, filenames) => {
            try {
                if (err) {
                    throw err;
                }

                const foundFiles = '```\n' + filenames.join('\n') + '\n```';
                interaction.editReply(`These are all the music I've got:\n${foundFiles}`);
            } catch (thrownErr) {
                interaction.editReply("Uh-oh! The DJ had some trouble fetching the music! :leopard: :sweat_drops:");
                console.log(`Failure listing all found files.\n${thrownErr}`);
            }
        });
    }
};
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(bot) {
        const now = new Date();
        console.log(`DJaguar is up and running - Details:\n - User Tag: ${bot.user.tag}\n - Start Date-Time: ${now.toDateString()}\n`);
    }
};
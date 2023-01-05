require('dotenv').config();
const utils = require('../utils/utils');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    initialize: function () {
        const pathToMusic = path.resolve(process.env.APP_PATH_TO_MUSIC);

        if (!fs.existsSync(pathToMusic)) {
            fs.mkdirSync(pathToMusic);
            utils.formattedLog("Created directory for file repository.");
        }

        const count = fs.readdirSync(pathToMusic).length;
        utils.formattedLog(`File repository initialized successfully. Found ${count} files.`);
    }
};
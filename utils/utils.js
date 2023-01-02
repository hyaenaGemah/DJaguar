module.exports = {
    formattedLog: function (message) {
        const now = new Date();
        console.log(`[${now.toLocaleString()}]: ${message}`);
    },
    nextSong: function () {
        let next = global.queueResources.repeat ? global.queueResources.current : null;

        if (global.queueResources.queue.length > 1) {
            const positionCurrent = global.queueResources.queue.indexOf(global.queueResources.current);
            const positionNext = positionCurrent + 1 >= global.queueResources.queue.length ? 0 : positionCurrent + 1;

            if (global.queueResources.repeat) {
                next = global.queueResources.queue[positionNext];
                global.queueResources.current = next;
            } else {
                next = positionNext > 0 ? global.queueResources.queue[positionNext] : null;
                global.queueResources.current = next;
            }
        }

        return next;
    }
};
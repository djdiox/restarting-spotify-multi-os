const restart = require('./index');
const os = require('os');
const process = require('process');
const fs = require('fs');

(async () => {
    let result = {
        success: false,
        message: '',
        error: null,
        path: '',
        killed: false,
        respawned: false,
        homedir: os.homedir(),
        os: process.platform,
        started: new Date(),
        finished: null,
        runtimeSeconds: 0,
        platform: process.platform,
        process: null
    }
    try {
        result = await restart();
        console.log(result);
    } catch (error) {
        console.error(error);
        result.error = error;
        process.exit(1);
    } finally {
        result.finished = new Date();
        result.runtimeSeconds = Math.abs((result.finished.getTime() - result.started.getTime()) / 1000);
        if (process.env?.LOG?.toLowerCase() === 'true') {
            fs.writeFileSync('./logs/details-run-' + new Date().getTime() + '.json', JSON.stringify(result, null, 2));
        }
        process.exit(0);
    }
})()
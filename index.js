const os = require('os');
const ps = require('ps-node');
const process = require('process');
const child_process = require('child_process');
const fs = require('fs');
require('dotenv').config('.env');

/**
 * Logs an Error Object properly
 * @param {Error} error the thrown error 
 * @param {Object} context some context infos
 * @returns the filled context object
 */
const logErr = (error = new Error(), context = {
    success: false,
    message: '',
    path: '',
    homedir: os.homedir(),
    os: process.platform
}, reject = () => {}) => {
    console.error(error)
    const stringified = error.toString();
    console.log(stringified);
    const message = error.name + ':\n' + error.message + '\n\n Stack Trace:\n' + error.stack;
    context.message = message;
    if (reject) {
        Promise.reject(message);
    }
    return context;
};

const findProcess = (query, result) => {
    return new Promise((resolve, reject) => {
        let cmd = '',
            path = '';
        switch (result.platform) {
            case 'win32':
                result.path = process.env.APPLICATION_PATH || `${result.homedir}\\AppData\\Roaming\\Spotify\\Spotify.exe`
                cmd = `tasklist`;
                break;
            case 'darwin':
                cmd = `ps -ax | grep ${query}`;
                result.path = process.env.APPLICATION_PATH || `/Aplications/Spotify.app`
                break;
            case 'linux':
                cmd = `ps -A`;
                result.path = fs.existsSync('/snap/bin/spotify') ? '/snap/bin/spotify' : fs.existsSync('/usr/bin/spotify') ? '/usr/bin/spotify' : process.env.APPLICATION_PATH;
                break;
            default:
                throw new Error('OS ' + result.platform + ' is not supported')
        }
        console.log('Running ' + cmd + ' because the platform is ' + result.platform, path)
        child_process.exec(cmd, (err, stdout, stderr) => {
            if (err || stderr) reject(err || stderr);
            var splitted = stdout.split('\n');
            var foundProcess = splitted.map(p => {
                    console.log('Searching ' + query + ' in line of task: ', p);
                    // var found = p.toLowerCase().indexOf(query.toLowerCase()) > -1;
                    var values = p.split(' ').filter(str => str !== '');
                    return {
                        pid: values[1],
                        name: values[0] || '',
                        origin: p,
                        path
                    }
                })
                .find(e => {
                    console.log('searching "' + e.origin + '" for "' + query + '"', e.origin.toLowerCase());
                    return e.origin.toLowerCase().includes(query.toLowerCase());
                });
            console.log(foundProcess);
            result.process = foundProcess;
            resolve(result);
        });
    })
};

const restart = async (name = process.env.APPLICATION_NAME || 'spotify', result = {
    name,
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
}) => {
    try {
        result = await findProcess(name, result);
        var noError = true
        if (fs.existsSync(result.path) === false) {
            result.message = 'Sorry! Spotify could not be found, \nPlease define SPOTIFY_DIR in the Environment Variables';
            noError = false;
        } else if (!result.process) {
            result.message = 'Spotify Process is not running'
            noError = false;
        }
        result.success = noError;
        if (result.success) {
            await finalize(result);
        } else {
            result.error = result.message;
        }
        console.log('Finished Process', result);
        return result;
    } catch (error) {
        return logErr(error, result)
    }

    async function finalize(result) {
        return new Promise(resolve => {
            console.log('Killing Process', result.process);
            result.killed = process.kill(result.process.pid);
            console.log('Killed Process', result);
            setTimeout(function () {
                result.respawned = child_process.execFileSync(result.path);
                console.log('Respawned Process', result.respawned)
                resolve()
            }, 100);
        })
    }
}

module.exports = restart;

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
        if(process.env?.LOG?.toLowerCase() === 'true') {
            fs.writeFileSync('./logs/details-run-' + new Date().getTime() + '.json', JSON.stringify(result, null, 2));
        }
        process.exit(0);
    }
})()
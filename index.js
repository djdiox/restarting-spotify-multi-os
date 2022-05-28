// const os = require('os');
const ps = require('ps-node');

const process = require('process');
const child_process = require('child_process');
const fs = require('fs');

const isRunning = (query) => {
    return new Promise((resolve, reject) => {
        let platform = process.platform;
        let cmd = '';
        switch (platform) {
            case 'win32':
                cmd = `tasklist`;
                break;
            case 'darwin':
                cmd = `ps -ax | grep ${query}`;
                break;
            case 'linux':
                cmd = `ps -A`;
                break;
            default:
                break;
        }
        child_process.exec(cmd, (err, stdout, stderr) => {
            if (err || stderr) reject(err || stderr);
            resolve(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
        });
    })
}
const logErr = (error = new Error(), context = {
    success: false,
    message: '',
    path: '',
    homedir: os.homedir(),
    os: process.platform
}) => {
    console.error(error)
    var stringified = error.toString()
    const message = err.name + ':\n' + err.message + '\n\n Stack Trace:\n' + err.stack;

}

const restart = async () => {
    const result = {
        success: false,
        message: '',
        path: '',
        homedir: os.homedir(),
        os: process.platform
    }
    const process = ps.lookup({
        command: 'spotify'
    }, (err, list) => {
        if (err) {
            result.success = false;
            result.message = err.name + ':\n' + err.message + '\n\n Stack Trace:\n' + err.stack;
            console.error(result.message);
            return result;
        }
        var promises =
            list.filter(e => e.command.includes('spotify'))
            .map(proc => {
                return new Promise((resolve, reject) => {
                    return ps.kill(proc.pid, (err) => {
                        const msg = `Killed Process "${proc.command}" with pid: ${proc.pid}`;
                        console.log(msg);
                        return err ? reject(err) : resolve(msg);
                    })
                })
            })
    });

    process
    switch (result.os) {
        case 'win32':
            result.path = `${result.homedir}\AppData\Roaming\Spotify\Spotify.exe`;
            const running = await isRunning('spotify.exe');
            if (running) {
                process.kill()
            }
            break;

        default:
            break;
    }
    if (!fs.existsSync(spotifyPath)) {
        result.message = 'Sorry! Spotify could not be found, \nPlease define SPOTIFY_DIR in the Environment Variables';
        console.error(result.message);
        result.success = false;
        return result;
    }
}

module.exports = restart()
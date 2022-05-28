const os = require('os');
const ps = require('ps-node');

const process = require('process');
const child_process = require('child_process');
const fs = require('fs');

const findProcess = (query) => {
    return new Promise((resolve, reject) => {
        let platform = process.platform;
        let cmd = '';
        let path = process.cwd();
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
        console.log('Running ' + cmd + ' because the platform is ' + platform)
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
                        origin: p
                    }
                })
                .find(e => {
                    console.log('searching "' + e.origin + '" for "' + query + '"', e.origin.toLowerCase());
                    return e.origin.toLowerCase().includes(query.toLowerCase());
                })
            console.log(foundProcess);
            resolve(foundProcess);
        });
    })
};
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
}, reject = Promise.reject) => {
    console.error(error)
    const stringified = error.toString();
    console.log(stringified);
    const message = error.name + ':\n' + error.message + '\n\n Stack Trace:\n' + error.stack;
    context.message = message;
    if (reject) {
        reject(message);
    }
    return context;
};

/**
 * 
 * @param {string} name The name of the app that should be closed.
 * @param {Object} result The result of the kill operation
 * @returns 
 */
const killProcesses = (name = 'spotify', result = {
    success: false,
    message: '',
    path: '',
    homedir: os.homedir(),
    os: process.platform
}) => {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(result.path)) {
                return reject(result.path + ' does not exist')
            }
            var pid = findProcess('spotify.exe')
            var cmdd = child_process.spawn(result.path);
            cmdd.stdout.on('data', function (data) {
                console.log('' + data);
            });
            cmdd.stderr.setEncoding('utf8');
            cmdd.stderr.on('data', function (data) {
                if (/^execvp\(\)/.test(data)) {
                    console.log('Failed to start child process.');
                }
            });
            // lookup({
            //     command: name
            // }, async (err, runningProcesses) => {
            //     if (err) {
            //         result.success = false;
            //         result.message = err.name + ':\n' + err.message + '\n\n Stack Trace:\n' + err.stack;
            //         console.error(result.message);
            //         return logErr(err, result);
            //     }
            //     console.log(`Searching for "${name}" in running processes`, runningProcesses);
            //     const processes = runningProcesses.filter(e => e.command.toLowerCase().includes(name));
            //     if (processes.length == 0) {
            //         result.message = `${name} could not be found in open tasks: ${processes.map(p => p.command).join(', ')}`;
            //         reject(result);
            //     }
            //     const processKillResults = await Promise.all(
            //         processes.map(proc => {
            //             return new Promise((resolve, reject) => {
            //                 return ps.kill(proc.pid, (err) => {
            //                     const msg = `Killed Process "${proc.command}" with pid: ${proc.pid}`;
            //                     console.log(msg);
            //                     return err ? reject(err) : resolve(msg);
            //                 });
            //             });
            //         }));
            //     resolve(processKillResults);
            // });
        } catch (exception) {
            console.error(exception);
            return reject(exception.message)
        }
    })
}

const restart = async (applicationName = process.env.APPLICATION_NAME || 'spotify', path = process.env.APPLICATION_PATH ||`${os.homedir()}\\AppData\\Roaming\\Spotify\\Spotify.exe`) => {
    
    const result = {
        success: false,
        message: '',
        path,
        homedir: os.homedir(),
        os: process.platform
    }
    // if (applicationName === 'spotify') {
    // }
    // console.log('Killing ' + applicationName);
    // // const responses = await killProcesses(applicationName, result);
    // switch (result.os) {
    //     case 'win32':
    //         // result.path = ;
    //         result.path = `${result.homedir}\\AppData\\Roaming\\Spotify\\Spotify.exe`
    //     case 'darwin':
    //         result.path = 'spotify';
    //         break;
    //     default:
    //         break;
    // }
    
    const spotifyProcess = await findProcess('spotify');
    if(fs.existsSync(result.path) === false) {
        result.message = 'Sorry! Spotify could not be found, \nPlease define SPOTIFY_DIR in the Environment Variables';
        result.success = false;
    }else if(!spotifyProcess) {
        result.message = 'Spotify Process is not running'
        result.success = false;
    }
    if(result.success) {
        console.log('Killing Process', spotifyProcess)
        const res = process.kill(spotifyProcess.pid);
        console.log('Killed Process', res);
        child_process.execFileSync(result.path)
    }
    return result;
}

module.exports = restart;

(async () => {
    try {
        const msg = await restart();
        console.log(msg);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})()
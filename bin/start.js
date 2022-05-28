#! /usr/bin/env node
// require('shelljs/global');
var process = require('process');
var shell = require("shelljs");
// var yargs = require("yargs");
const run = require("../export");
(async () => {
    const res = await run();
    console.log('Starting Spotify', res)
    if(res.success) {
        const result = shell.exec(result.path);
        console.log(result);
        process.exit(0)
    }
})()
// restartSpotify()
// var argv = yargs.command('restart-spotify', true, function (yargs) {
//         console.log('Restarting Spotify!', yargs)
//         restartSpotify();
//         console.log('done');
//     })
//     .argv
// exec("restart-spotify");
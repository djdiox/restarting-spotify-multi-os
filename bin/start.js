#! /usr/bin/env node

var shell = require("shelljs");
var yargs = require("yargs");
var restartSpotify = require("../index");
var argv = yargs.usage('$0 command')
    .command('restart-spotify', true, function (yargs) {
        console.log('Restarting Spotify!', yargs)
        restartSpotify();
        console.log('done');
    })
    .argv
// shell.exec("restart-spotify");
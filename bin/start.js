#! /usr/bin/env node

var shell = require("shelljs");
var yargs = require("yargs");
var restartSpotify = require("../index");
var argv = yargs.usage('$0 command')
    .command('restart-spotify', true, function (yargs) {
        restartSpotify()
    })
    .argv
// shell.exec("restart-spotify");
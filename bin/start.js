#! /usr/bin/env node
var shell = require("shelljs");
var restartSpotify = require("../index");
restartSpotify()
shell.exec("restart-spotify");
/**
 * Copyright 2018 FAPS.
 * 
 * File: open_access.js
 * Project: SP 142
 * Author:
 *  - Jupiter Bakakeu
 *
 * This program is free software: you can redistribute it and/or modify  
 * it under the terms of the GNU General Public License as published by  
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License 
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 * 
 * --------------------------------------------------------------------
 * ###################### Changes #####################################
 * -- 28.11.2016
 *      Initial implementation
 * --------------------------------------------------------------------
 **/


var http = require('http');
var https = require('https');
var util = require("util");
var express = require("express");
var crypto = require("crypto");
var path = require("path");
var fs = require("fs-extra");
var when = require('when');

var OPEN_ACCESS = require("./application");
global.OPEN_ACCESS = OPEN_ACCESS;

var server;
var app = express();

// Configure the settings

var settings = {};

var userDir = path.join(__dirname, ".open_access_settings"); //process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
var userSettingsFile = path.join(userDir, 'settings_' + require('os').hostname() + '.js');
var userSettingsFileJson = path.join(userDir, 'settings_' + require('os').hostname() + '.json');

if (fs.existsSync(userSettingsFileJson)) {
    try {
        settings = JSON.parse(fs.readFileSync(userSettingsFileJson, 'utf8'));
        settings.settingsFile = userSettingsFileJson;
    } catch (err) {
        console.log("[OPEN ACCESS] JSON Settings file: " + userSettingsFileJson + " is not well formatted. Please delete it.");
        console.log('[OPEN ACCESS] is on exit with code: ' + 1);
        process.exit(1);
    }
} else if (fs.existsSync(userSettingsFile)) {
    try {
        settings = require(userSettingsFile);
        settings.settingsFile = userSettingsFile;
    } catch (err) {
        console.log("[OPEN ACCESS] Settings file: " + userSettingsFile + " is not well formatted. Please delete it.");
        console.log('[OPEN ACCESS] is on exit with code: ' + 1);
        process.exit(0);
    }
} else {
    var defaultSettings = path.join(__dirname, "default_settings.js");
    var settingsStat = fs.statSync(defaultSettings);
    var settingsFile;

    fs.copySync(defaultSettings, userSettingsFile);
    if (settingsStat.mtime.getTime() < settingsStat.ctime.getTime()) {
        // Default settings file has not been modified - safe to copy
        fs.copySync(defaultSettings, userSettingsFile);
        settingsFile = userSettingsFile;
    } else {
        // Use default default_settings.js as it has been modified
        settingsFile = defaultSettings;
    }
    settings = require(settingsFile);
    settings.settingsFile = settingsFile;
}

try {

    settings.userDir = userDir;
    // Check and configure the setting file
    settings.verbose = true;
    settings.uiPort = settings.uiPort || 1717;
    settings.uiHost = settings.uiHost || "127.0.0.1";


} catch (err) {
    console.log("Error loading settings file: " + settingsFile);
    if (err.code == 'MODULE_NOT_FOUND') {
        if (err.toString().indexOf(settingsFile) === -1) {
            console.log(err.toString());
        }
    } else {
        console.log(err);
    }
    process.exit(1);
}




// Configure the webserver
server = http.createServer(function(req, res) { app(req, res); });

// initialize the plattform

try {
    OPEN_ACCESS.init(server, settings);
} catch (err) {
    console.log("[OPEN ACCESS] Failed to start OPEN ACCESS: " + err);
    console.log('[OPEN ACCESS] is on exit with code: ' + 1);
    process.exit(1);
}

// Start the plattform
OPEN_ACCESS.start().then(function() {
    process.title = "Open Access Process SP 142";

}).otherwise(function(err) {
    console.log("server.failed-to-start" + err);
    console.log('[OPEN ACCESS] is on exit with code: ' + 1);
    process.exit(1);
});

process.on('uncaughtException', function(err) {
    console.log('[OPEN ACCESS] Uncaught Exception:' + err.stack);
    console.log('[OPEN ACCESS] is on exit with code: ' + 1);
    process.exit(1);
});

// Stop the platform if the user request it
process.on('SIGINT', function() {
    OPEN_ACCESS.stop();
    console.log('[OPEN ACCESS] is on exit with code: ' + 0);
    process.exit(0);
});

process.on('exit', (code) => {
    console.log('[OPEN ACCESS] is on exit with code: ' + code);
});
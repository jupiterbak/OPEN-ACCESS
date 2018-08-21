/**
 * Copyright 2018 FAPS.
 * 
 * File: open_access.js
 * Project: SP 142
 * Author:
 *  - Jupiter Bakakeu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    settings = JSON.parse(fs.readFileSync(userSettingsFileJson, 'utf8'));
    settings.settingsFile = userSettingsFileJson;
} else if (fs.existsSync(userSettingsFile)) {
    settings = require(userSettingsFile);
    settings.settingsFile = userSettingsFile;
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
    process.exit();
}




// Configure the webserver
server = http.createServer(function(req, res) { app(req, res); });

// initialize the plattform

try {
    OPEN_ACCESS.init(server, settings);
} catch (err) {
    console.log("Failed to start OPEN ACCESS: " + err);
    process.exit(1);
}

// Start the plattform
OPEN_ACCESS.start().then(function() {
    process.title = "Open Access Process SP 142";

}).otherwise(function(err) {
    console.log("server.failed-to-start" + err);
    process.exit(1);
});



process.on('uncaughtException', function(err) {
    console.log('[OPEN ACCESS] Uncaught Exception:' + err.stack);
    process.exit(1);
});

// Stop the platform if the user request it
process.on('SIGINT', function() {
    OPEN_ACCESS.stop();
    process.exit(0);
});
/**
 * Copyright 2018 FAPS.
 * 
 * File: application/engine/index.js
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

var when = require('when');
var path = require('path');
var fs = require("fs");
var os = require("os");
var util = require("./util");
var log = require("./log");
var DAGS = require("./dags");
//var storage = require("./storage");
var settings = require("./../setting_manager");
var _userSettings;
// internal variables
var started = false;

function init(app, userSettings, inputbus, outputbus) {
    userSettings.version = getVersion();
    _userSettings = userSettings;
    log.init(userSettings);
    settings.init(userSettings);

    // Initialize the DAGs
    DAGS.init(this, _userSettings.engine);

    // Initialize all Containers found in the userSettings

    log.info("Engine initialized successfully!");
}

var version;

function getVersion() {
    if (!version) {
        var pkg = require(path.join(__dirname, "..", "..", "package.json"));
        version = pkg.version;
    }
    return version;
}

function start(app) {



    console.log("\n\n===============================\n" + "OPEN ACCESS engine.welcome\n===============================\n");
    if (settings && settings.version) {
        log.info("runtime.version OPEN ACCESS :" + settings.version);
    }
    log.info("runtime.version Node JS" + process.version);
    log.info(os.type() + " " + os.release() + " " + os.arch() + " " + os.endianness());

    DAGS.startDAGs(app);

    if (log.metric()) {
        runtimeMetricInterval = setInterval(function() {
            reportMetrics();
        }, settings.runtimeMetricInterval || 15000);
    }

    // Load all the Containers and connect it
    log.info("engine started successfully.");
}

function reportMetrics() {
    var memUsage = process.memoryUsage();

    log.log({
        level: log.METRIC,
        event: "engine.memory.rss",
        value: memUsage.rss
    });
    log.log({
        level: log.METRIC,
        event: "engine.memory.heapTotal",
        value: memUsage.heapTotal
    });
    log.log({
        level: log.METRIC,
        event: "engine.memory.heapUsed",
        value: memUsage.heapUsed
    });
}


var engine = module.exports = {
    init: init,
    start: start,
    stop: function(app) {
        DAGS.stopDAGs(app);
        started = false;
        console.log("engine stopped successfully.");
    },
    version: getVersion,
    log: log,
    settings: settings,
    util: require("./util"),
    isStarted: function() {
        return started;
    },
    newOutputValue: function() {
        console.log('Engine - New Ouput Value is:', arg1);
    },
    userSettings: _userSettings,
    getDAGS: function() { return DAGS }
};
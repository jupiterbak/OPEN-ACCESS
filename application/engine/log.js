/**
 * Copyright 2018 FAPS.
 * 
 * File: application/engine/log.js
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
var util = require("util");
var EventEmitter = require("events").EventEmitter;


var levels = {
    off: 1,
    fatal: 10,
    error: 20,
    warn: 30,
    info: 40,
    debug: 50,
    trace: 60,
    audit: 98,
    metric: 99
};

var levelNames = {
    10: "fatal",
    20: "error",
    30: "warn",
    40: "info",
    50: "debug",
    60: "trace",
    98: "audit",
    99: "metric"
};

var logHandlers = [];

var metricsEnabled = false;

var LogHandler = function(settings) {
    // initialize the default logger from the settings
    this.logLevel = settings ? levels[settings.level] || levels.info : levels.info;
    this.metricsOn = settings ? settings.metrics || false : false;

    metricsEnabled = metricsEnabled || this.metricsOn;

    this.handler = (settings && settings.handler) ? settings.handler(settings) : consoleLogger;
    this.on("log", function(msg) {
        if (this.shouldReportMessage(msg.level)) {
            this.handler(msg);
        }
    });
};

util.inherits(LogHandler, EventEmitter);

LogHandler.prototype.shouldReportMessage = function(msglevel) {
    return (msglevel == log.METRIC && this.metricsOn) ||
        (msglevel == log.AUDIT && this.auditOn) ||
        msglevel <= this.logLevel;
};

var consoleLogger = function(msg) {
    if (msg.level == log.METRIC || msg.level == log.AUDIT) {
        util.log("[" + levelNames[msg.level] + "] " + JSON.stringify(msg));
    } else {
        var message = msg.msg;
        if (typeof message === 'object' && message.toString() === '[object Object]' && message.message) {
            message = message.message;
        }
        util.log("[" + levelNames[msg.level] + "] " + (msg.type ? "[" + msg.type + ":" + (msg.name || msg.id) + "] " : "") + message);
    }
};

var log = module.exports = {
    FATAL: 10,
    ERROR: 20,
    WARN: 30,
    INFO: 40,
    DEBUG: 50,
    TRACE: 60,
    AUDIT: 98,
    METRIC: 99,

    init: function(settings) {
        // Initialize the logger from the settings
        logHandlers = [];
        var loggerSettings = {};
        if (settings.logging) {
            var keys = Object.keys(settings.logging);
            if (keys.length === 0) {
                log.addHandler(new LogHandler());
            } else {
                for (var i = 0, l = keys.length; i < l; i++) {
                    var config = settings.logging[keys[i]];
                    loggerSettings = config || {};
                    if ((keys[i] === "console") || config.handler) {
                        log.addHandler(new LogHandler(loggerSettings));
                    }
                }
            }
        } else {
            log.addHandler(new LogHandler());
        }
    },
    addHandler: function(func) {
        logHandlers.push(func);
    },
    removeHandler: function(func) {
        var index = logHandlers.indexOf(func);
        if (index > -1) {
            logHandlers.splice(index, 1);
        }
    },
    log: function(msg) {
        msg.timestamp = Date.now();
        logHandlers.forEach(function(handler) {
            handler.emit("log", msg);
        });
    },
    info: function(msg) {
        log.log({ level: log.INFO, msg: msg });
    },
    warn: function(msg) {
        log.log({ level: log.WARN, msg: msg });
    },
    error: function(msg) {
        log.log({ level: log.ERROR, msg: msg });
    },
    err: function(msg) {
        log.log({ level: log.ERROR, msg: msg });
    },
    trace: function(msg) {
        log.log({ level: log.TRACE, msg: msg });
    },
    debug: function(msg) {
        log.log({ level: log.DEBUG, msg: msg });
    },
    metric: function() {
        return metricsEnabled;
    },
};
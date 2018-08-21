/**
 * Copyright 2018 FAPS.
 * 
 * File: application/configurator/index.js
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
var app = null;
var when = require('when');
var southboundsHandlers;
var northboundsHandlers;
var apis;

module.exports = {
    app: app,
    init: function(httpServer, _app, userSettings) {
        app = _app;


        // Initialize the nothbounds modules from the settings
        northboundsHandlers = [];
        var moduleSettings = {};
        if (userSettings.northbounds) {
            var keys = Object.keys(userSettings.northbounds);
            if (keys.length === 0) {
                app.engine.log.warn("Empty northbounds defined");
            } else {
                for (var i = 0, l = keys.length; i < l; i++) {
                    try {
                        var config = userSettings.northbounds[keys[i]];
                        moduleSettings = config || {};
                        var nModule = require("../modules/northbounds/" + moduleSettings.type);
                        var ninstance = new nModule();
                        ninstance.init(app, config);
                        northboundsHandlers.push(ninstance);
                    } catch (error) {
                        console.log(error);
                        app.engine.log.warn("Northbound module cannot be initialized. Module: " + keys[i] + " - Error: " + error);
                    }
                }
            }
        } else {
            app.engine.log.warn("No Northbounds settings defined");
        }


        // Southbounds modules instanzieren
        southboundsHandlers = [];
        if (userSettings.southbounds) {
            var keys = Object.keys(userSettings.southbounds);
            if (keys.length === 0) {
                app.engine.log.warn("Empty southbounds defined");
            } else {
                for (var i = 0, l = keys.length; i < l; i++) {
                    try {
                        var config = userSettings.southbounds[keys[i]];
                        moduleSettings = config || {};
                        var sModule = require("../modules/southbounds/" + config.type);
                        var instance = new sModule();
                        instance.init(app, config);
                        southboundsHandlers.push(instance);
                    } catch (error) {
                        app.engine.log.warn("Southbound module cannot be initialized. Module: " + keys[i] + " - Error: " + error);
                        console.log(error);
                    }
                }
            }
        } else {
            app.engine.log.warn("No Southbounds settings defined");
        }


        // Start the runtime engine
        app.engine.init(app, userSettings, app.inputbus, app.outputbus);

        // Start the API Modules
        apis = [];
        userSettings.api = userSettings.api || [];
        var _apis = userSettings.api || [];
        _apis.forEach(function(el) {
            try {
                var apiModule = require("../api/" + el.name);
                apiModule.init(app, el);
                apis.push(apiModule);
            } catch (error) {
                app.engine.log.warn("API module cannot be initialized. Module: " + el.name + " - Error: " + error);
            }
        });

        // log the step
        app.engine.log.info("Configurator initialized successfully.");
        return when.resolve();
    },
    start: function() {
        // Start all module

        // northbounds
        northboundsHandlers.forEach(function(n_el) {
            try {
                n_el.start();
            } catch (error) {
                app.engine.log.warn("Northbound module cannot be started. Module: " + n_el.settings.id + " - Error: " + error);
            }
        });

        // souththbounds
        southboundsHandlers.forEach(function(s_el) {
            try {
                s_el.start();
            } catch (error) {
                app.engine.log.warn("Southbound module cannot be started. Module: " + s_el.settings.id + " - Error: " + error);
            }
        });

        // engine
        app.engine.start(app);

        // Apis
        apis.forEach(function(s_el) {
            try {
                s_el.start();
            } catch (error) {
                app.engine.log.warn("Api module cannot be started. Module: " + s_el.settings.id + " - Error: " + error);
            }
        });

        // TODO: Start all Module
        /*
        return runtime.start().then(function() {
            // Callback
        });*/
        app.engine.log.info("Configurator start successfully.");
        return when.resolve();
    },
    stop: function() {
        // Stop all modules

        // Apis
        apis.forEach(function(s_el) {
            try {
                s_el.stop();
            } catch (error) {
                app.engine.log.warn("API module cannot be stopped. Module: " + s_el.settings.id + " - Error: " + error);
            }
        });

        app.engine.stop(app);

        // souththbounds
        southboundsHandlers.forEach(function(s_el) {
            try {
                s_el.stop();
            } catch (error) {
                app.engine.log.warn("Southbound module cannot be stopped. Module: " + s_el.settings.id + " - Error: " + error);
            }
        });

        // northbounds
        northboundsHandlers.forEach(function(n_el) {
            try {
                n_el.stop();
            } catch (error) {
                app.engine.log.warn("Northbound module cannot be stopped. Module: " + n_el.settings.id + " - Error: " + error);
            }
        });

        app.engine.log.info("Configurator stoped successfully.");
        return when.resolve();
    },
    getnorthboundsHandlers: function() { return northboundsHandlers; },
    getsouthboundsHandlers: function() { return southboundsHandlers; },
    getAapis: function() { return apis; },
    getApp: function() { return app; }
};
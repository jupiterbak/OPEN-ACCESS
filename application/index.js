/**
 * Copyright 2018 FAPS.
 * 
 * File: application/index.js
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
var fs = require("fs");
var path = require('path');
var when = require('when');

var engine = require("./engine");
var inputbus = require("./inputbus");
var outputbus = require("./outputbus");
var configurationbus = require("./configurationbus");
var storage = require("./storage");
var setting_manager = require("./setting_manager");

//var swagger = require("./swagger");
var configurator = require("./configurator");

var started = false;
process.env.OPEN_ACCESS_HOME = process.env.OPEN_ACCESS_HOME || path.resolve(__dirname + "/..");

// Internal variable
var server = null;

module.exports = {
    init: function(httpServer, userSettings) {

        // Check that the user settings are consistent
        if (!userSettings) {
            userSettings = httpServer;
            httpServer = null;
        }
        server = httpServer;

        storage.init(userSettings.userDir, 'settings_' + require('os').hostname() + '.json', userSettings);
        setting_manager.load(storage).done(function() {
            var current_settings = setting_manager.getGlobalSetting();
        });              
        
        // Initialize all the modules from the settings
        // TODO: not implemented yet
        // configurator        
        configurator.init(httpServer, this, userSettings);
        
        // log the step
        console.log("OPEN_ACCESS initialized successfully.");
        return when.resolve();
    },
    restart: function(new_setting) {

    },
    isStarted: function() {
        return started;
    },
    start: function() {
        started = true;
        var self = this;

        storage.addConfigFileListener(function(_path, stats) {
            //if (path.basename(_path) === storage.getGlobalSettingsFile()) {
                var new_settings = setting_manager.loadSync(storage);
                if (new_settings && started) {
                    configurator.stop();
                    inputbus.removeAllListeners();
                    outputbus.removeAllListeners();
                    configurator.init(server, self, new_settings);
                    configurator.start();
                }
            //}
        });

        // Start all module
        configurator.start();
        storage.startListening();
        console.log("OPEN_ACCESS start successfully.");
        return when.resolve();
    },
    stop: function() {
        started = false;
        // Stop all modules
        configurator.stop();
        console.log("OPEN_ACCESS stopped successfully.");
        return when.resolve();
    },

    //nodes: runtime.nodes,
    setting_manager: setting_manager,
    storage: storage,
    log: engine.log,
    settings: engine.settings,
    util: engine.util,
    version: engine.version,
    inputbus: inputbus,
    outputbus: outputbus,
    configurationbus: configurationbus,
    engine: engine,
    
    //comms: swagger.comms,
    //library: swagger.library,
    //auth: swagger.auth,
    getConfigurator: function() { return configurator; },
    getSettingManager: function() { return setting_manager; },
    getStorage: function() { return storage; },
    getApp: function() { return this; },
    getServer: function() { return server; }
};
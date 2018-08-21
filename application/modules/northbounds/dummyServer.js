/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/northbounds/dummyServer.js
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
 * ###################### Description #####################################
 * dummyServer -- Simulate the behaviour of a server by logging the values
    example_config: {
        id: "dummyServer1", 		// Unique ID of the module in the global configuration
        name: "dummyServer1", 	    // Name of the module instance.
        type: "dummyServer", 	    // Type of the module, should always be "dummyServer" in order to use this module
        modulesetting: {},
        inputs_variables: [ 	// The output variables specify the variables to generate
            {
                name: "Portal_Spannung_L1_N", 	// Variable Name
                datatype: "real", 				// Type of the data to read: "real", "int", "byte"
                si_unit: "V", 					// Unit of the data variable. It is optional
                default: 0.0 					// Default value
            },
            {
                name: "Portal_Spannung_L2_N",
                datatype: "real",
                si_unit: "V",
                default: 0.0
            }
        ]
    }
**/

var when = require('when');
var util = require("util");


var northboundModuleInterface = function() {};

northboundModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "dummyServer";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {};
    self.settings.inputs_variables = self.settings.inputs_variables || [];

    self.app.engine.log.info("Northbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
northboundModuleInterface.prototype.start = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.addListener(el.name, function(arg) {
            self.app.engine.log.info("Northbound[" + self.settings.name + "] ### --> " + el.name + " : " + arg);
        });
    });

    self.app.engine.log.info("Northbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
northboundModuleInterface.prototype.stop = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.removeAllListeners(el.name);
    });

    self.app.engine.log.info("Northbound[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};
northboundModuleInterface.prototype.getSettings = function() {
    var self = this;
    return self.settings
};

module.exports = northboundModuleInterface;
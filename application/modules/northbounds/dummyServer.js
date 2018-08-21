/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/northbounds/dummyServer.js
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
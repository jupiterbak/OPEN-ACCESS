/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/dummyClient.js
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
 * dummyClient --Generate random Variable values
 * Below is a configuration example 
    example_config: {
        id: "dummyClient1", 		// Unique ID of the module in the global configuration
        name: "dummyClient1", 	// Name of the module instance.
        type: "dummyClient", 	// Type of the module, should always be "dummyClient" in order to use this module
        modulesetting: {
            interval: 1000, 	// Time interval at which a new Variable will be generated.
        },
        outputs_variables: [ 	// The output variables specify the variables to generate
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
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');

var southboundModuleInterface = function() {};

southboundModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "dummyClient";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || { interval: 1000 };
    self.settings.outputs_variables = self.settings.outputs_variables || [];

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.start = function() {
    var self = this;
    self.generator = setInterval(function() {
        self.settings.outputs_variables.forEach(function(el) {
            var val = (Math.random() * 100);
            var n = el.name;
            self.app.inputbus.emit(n, val);
        });
    }, self.settings.modulesetting.interval);
    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.stop = function() {
    var self = this;
    clearInterval(self.generator);

    self.app.engine.log.info("Southbound[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};

module.exports = southboundModuleInterface;
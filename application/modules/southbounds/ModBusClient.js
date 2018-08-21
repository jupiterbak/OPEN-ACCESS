/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/ModBusClient.js
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
 * ModBus Client -- Below is a configuration example
 	example_config: {
		id: "modbusTCP1", 		// Unique ID of the module in the global configuration
		name: "modbusTCP1", 	// Name of the module instance.
		type: "ModBusClient", 	// Type of the module, should always be "ModBusClient" in order to use this module
		modulesetting: {
			ip: '192.168.1.16', // Remote IP-Address of the Modbus server module
			port: 502, 			// Remote Port of the ModBus server module
			clientID: 9, 		// ModBus Client ID
			interval: 1000, 	// Interval to pool the data
			start: 1, 			// Start Address of the registers to read
			size: 100, 			// Size in Bytes of the registers to read
			object_name: "Portal_Stream_Energy_Data" // Name of the object that will hold all the data read.
		},
		outputs_variables: [ 	// The output variables specify how to interpret and map the data received
			{
				name: "Portal_Spannung_L1_N", 	// Variable Name
				datatype: "real", 				// Type of the data to read: "real", "int", "byte"
				si_unit: "V", 					// Unit of the data variable. It is optional
				address: 1, 					// Start Address on the remote modBus server.
				default: 0.0 					// Default value
			},
			{
				name: "Portal_Spannung_L2_N",
				datatype: "real",
				si_unit: "V",
				address: 1,
				default: 0.0
			}
		]
	}
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');
var ModbusRTU = require("modbus-serial");
var backoff = require('backoff');


var ModBusTCPModuleInterface = function() {
    this.client = new ModbusRTU();
    this.object_received = {
        name: "ModBus_Data",
        data: {}
    };
};

ModBusTCPModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "ModBusClient";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || { ip: 'localhost', interval: 1000, port: 502, clientID: 9 };
    self.settings.modulesetting.port = self.settings.modulesetting.port || 502;
    self.settings.modulesetting.interval = self.settings.modulesetting.interval || 10000;
    self.settings.modulesetting.ip = self.settings.modulesetting.ip || "localhost";
    self.settings.modulesetting.clientID = self.settings.modulesetting.clientID || 9;

    self.settings.modulesetting.start = self.settings.modulesetting.start || 1; // Start Address to read
    self.settings.modulesetting.size = self.settings.modulesetting.size || 4; // Start of the memory to read

    self.settings.outputs_variables = self.settings.outputs_variables || [];

    self.settings.modulesetting.object_name = self.settings.modulesetting.object_name || "ModBus_Data";
    self.settings.modulesetting.object_data = self.settings.modulesetting.object_data || {};

    // Initialize the Backoff strategy
    self.fibonacciBackoff = backoff.fibonacci({
        randomisationFactor: 0,
        initialDelay: 1000,
        maxDelay: 30000
    });
    //self.fibonacciBackoff.failAfter(10);

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};

ModBusTCPModuleInterface.prototype.start = function() {
    var self = this;

    self.fibonacciBackoff.on('backoff', function(number, delay) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] will attempt a new connection in : " + delay + 'ms - attempt ' + number + '.');
    });

    self.fibonacciBackoff.on('fail', function() {
        self.app.engine.log.warn("Southbound[" + self.settings.name + "] couldn't connect to: " + self.settings.modulesetting.ip + ' will retry.');
    });

    self.fibonacciBackoff.on('ready', function(number, delay) {
        try {
            self.client.connectTCP(self.settings.modulesetting.ip, { port: self.settings.modulesetting.port }).then(function() {
                self.client.setID(self.settings.modulesetting.clientID);
                self.client.setTimeout(200);
                self.object_received.name = self.settings.modulesetting.object_name;
                self.generator = setInterval(function() {
                    self.client.readHoldingRegisters(self.settings.modulesetting.start, self.settings.modulesetting.size, function(err, data) {
                        if (err) {
                            self.app.engine.log.warn("Southbound[" + self.settings.name + "] Data Error :" + JSON.stringify(err));
                            clearInterval(self.generator);
                            self.fibonacciBackoff.backoff();
                        } else {
                            self.settings.outputs_variables.forEach(function(el) {
                                try {
                                    var n = el.name;
                                    // TODO fix index range
                                    el.address = el.address || 1;
                                    var floatA = data.buffer.readFloatBE(el.address - 1);
                                    self.object_received.data[el.name] = floatA;
                                } catch (err) {
                                    self.app.engine.log.info("Southbound[" + self.settings.name + "] Exception :" + err);
                                }
                            });
                            self.app.inputbus.emit(self.object_received.name, self.object_received);
                            //self.app.engine.log.info("MODBUS DATA for " + self.object_received.name+ " :" + JSON.stringify(self.object_received));
                            self.fibonacciBackoff.reset();
                        }
                    });
                }, self.settings.modulesetting.interval);
            }, function(err) {
                self.fibonacciBackoff.backoff();
            });
        } catch (err) {
            self.fibonacciBackoff.backoff();
        }
    });
    self.fibonacciBackoff.backoff();
    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
ModBusTCPModuleInterface.prototype.stop = function() {
    var self = this;
    clearInterval(self.generator);
    self.fibonacciBackoff.reset();

    self.app.engine.log.info("Southbound[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};

module.exports = ModBusTCPModuleInterface;
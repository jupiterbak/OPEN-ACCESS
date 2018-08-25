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
 * SNAP7Client -- Below is a configuration example
 	example_config: {
		id: "SNAP7Client1", 		// Unique ID of the module in the global configuration
		name: "SNAP7Client1", 	    // Name of the module instance.
		type: "SNAP7Client", 	    // Type of the module, should always be "SNAP7Client" in order to use this module
		modulesetting: {
			ip: '192.168.1.16',     // Remote IP-Address of the PLC server module
			rack: 0, 			    // PLC Rack number
			slot: 1, 		        // PLC Slot number
			interval: 1000, 	    // Interval to pool the data
		},
		outputs_variables: [ 	// The output variables specify how to interpret and map the data received
			{
				name: "Portal_Spannung_L1_N", 	// Variable that will hold the serialized value comming from the PLC.
				datatype: "real", 				// Type of the data to read: "real", "int", "byte"
				si_unit: "V", 					// Unit of the data variable. It is optional
				area:0x81,                      // Area identifier (0x81 Process inputs, 0x82 Process outputs, 0x83	Merkers, 0x84 DB, 0x1C Counters,0x1D Timers)
                dbNumber:21,                    // DB number if area = 0x84, otherwise ignored
                start:0,                        // Offset to start
                amount:100,                     // Amount of words to read
                wordLen:0x08                    // Word size (0x01 Bit (inside a word), 0x02 Byte (8 bit), 0x04	Word (16 bit), 0x06	Double Word (32 bit), 0x08	Real (32 bit float), 0x1C	Counter (16 bit), 0x1D	Timer (16 bit))
			},
			{
				name: "Portal_Spannung_L3_N", 	// Variable that will hold the serialized value comming from the PLC.
				datatype: "real", 				// Type of the data to read: "real", "int", "byte"
				si_unit: "V", 					// Unit of the data variable. It is optional
				area:0x81,                      // Area identifier (0x81 Process inputs, 0x82 Process outputs, 0x83	Merkers, 0x84 DB, 0x1C Counters,0x1D Timers)
                dbNumber:21,                    // DB number if area = 0x84, otherwise ignored
                start:0,                        // Offset to start
                amount:100,                     // Amount of words to read
                wordLen:0x08                    // Word size (0x01 Bit (inside a word), 0x02 Byte (8 bit), 0x04	Word (16 bit), 0x06	Double Word (32 bit), 0x08	Real (32 bit float), 0x1C	Counter (16 bit), 0x1D	Timer (16 bit))
			}
		]
	}
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');
var SNAP7Lib = require("node-snap7");
var backoff = require('backoff');
var events = require('events');

var SNAP7ModuleInterface = function() {
    this.client = new SNAP7Lib.S7Client();
};

SNAP7ModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "ModBusClient";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || { ip: 'localhost', interval: 1000, rack: 0, slot: 1 };
    self.settings.modulesetting.rack = self.settings.modulesetting.rack || 0;
    self.settings.modulesetting.interval = self.settings.modulesetting.interval || 10000;
    self.settings.modulesetting.ip = self.settings.modulesetting.ip || "localhost";
    self.settings.modulesetting.slot = self.settings.modulesetting.slot || 1;

    self.settings.outputs_variables = self.settings.outputs_variables || [];

    // Initialize the Backoff strategy
    self.fibonacciBackoff = backoff.fibonacci({
        randomisationFactor: 0,
        initialDelay: 1000,
        maxDelay: 10000
    });
    //self.fibonacciBackoff.failAfter(10);

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};

SNAP7ModuleInterface.prototype.start = function() {
    var self = this;
    
    self.eventEmitter = new events.EventEmitter();

    self.fibonacciBackoff.on('backoff', function(number, delay) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] will start connection in : " + delay + 'ms - attempt ' + number + '.');
    });

    self.fibonacciBackoff.on('fail', function() {
        self.app.engine.log.warn("Southbound[" + self.settings.name + "] couldn't connect to: " + self.settings.modulesetting.ip + ' will retry.');
    });

    self.fibonacciBackoff.on('ready', function(number, delay) {
        try {
            self.client.ConnectTo(self.settings.modulesetting.ip, self.settings.modulesetting.rack, self.settings.modulesetting.slot, function(err) {
                if (err) {
                    self.fibonacciBackoff.backoff();
                    return;
                }
                self.fibonacciBackoff.reset();
                self.generator = setInterval(function() {
                    if(self.client.Connected()=== true){
                        self.settings.outputs_variables.forEach(function(el) {
                            if(self.client.Connected()===true){
                                res = self.client.ReadArea(el.area, el.dbNumber, el.start, el.amount, el.wordLen);
                                if (res) {
                                    var value = el.default;
                                    if(res){
                                        var buffer = new Buffer(res.buffer);
                                        if(el.datatype === "byte" && buffer.length > 0){
                                            value = buffer.readUInt8(0);
                                            self.app.inputbus.emit(el.name, value); // Forward the serialized bytestream
                                        } else if(el.datatype === "int" && buffer.length >= 4){
                                            value = buffer.readInt32BE(0);
                                            self.app.inputbus.emit(el.name, value); // Forward the serialized bytestream
                                        }else if(el.datatype === "real" && buffer.length >= 4){
                                            value = buffer.readFloatBE(0);
                                            self.app.inputbus.emit(el.name, value); // Forward the serialized bytestream
                                        }else{
                                            value = buffer;
                                            self.app.inputbus.emit(el.name, value); // Forward the serialized bytestream
                                        }
                                    // TODO: implements a deserialisation mechanism
                                    }    
                                }  else{
                                    self.app.engine.log.info("Southbound[" + self.settings.name + "] Exception while reading Variable. ");
                                    self.eventEmitter.emit('disconnected');
                                }   
                            }                             
                        });                       
                    }
                }, self.settings.modulesetting.interval);
            });
            
        } catch (err) {
            self.fibonacciBackoff.reset();
            self.fibonacciBackoff.backoff();
        }
    });

    self.eventEmitter.on('disconnected', function name(err) {
        clearInterval(self.generator);
        self.client.Disconnect();
        self.fibonacciBackoff.reset();
        self.fibonacciBackoff.backoff();
    });

    self.fibonacciBackoff.backoff();
    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
SNAP7ModuleInterface.prototype.stop = function() {
    var self = this;
    clearInterval(self.generator);
    self.client.Disconnect();
    self.fibonacciBackoff.reset();

    self.app.engine.log.info("Southbound[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};

module.exports = SNAP7ModuleInterface;
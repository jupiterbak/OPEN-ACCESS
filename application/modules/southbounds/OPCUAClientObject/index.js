/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/OPC-UA-ClientManager.js
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
 * OPCUAClientObject -- OPC UA Client
 	example_config: {
		id: "OPCUAClientObject1", 		// Unique ID of the module in the global configuration
		name: "OPCUAClientObject1", 	    // Name of the module instance.
		type: "OPCUAClientObject", 	    // Type of the module, should always be "OPCUAClientObject" in order to use this module
		modulesetting: {
            server_adress: "localhost",     // Address of the remote opc ua server
			port: 48020, 			        // Remote Port of the opc ua server module
            interval: 1000, 	            // default monitoring interval
            object_name: "OPCUAClientObject"
		},
		outputs_variables: [ 	// The output variables specify how to interpret and map the data received
            {
                name: "Demo.Dynamic.Scalar.Double", // Variable Name
                nodeId: {
                    ns: 4, // NamespaceIndex of the variable to monitor
                    nid: "Demo.Dynamic.Scalar.Double" // NodeId of the opcua variable
                },
                interval: 100, // Monitoring interval
                default: 0.0 // Default value
            },
            {
                name: "Demo.Dynamic.Scalar.Float", // Variable Name
                nodeId: {
                    ns: 4, // NamespaceIndex of the variable to monitor
                    nid: "Demo.Dynamic.Scalar.Float" // NodeId of the opcua variable
                },
                interval: 100, // Monitoring interval
                default: 0.0 // Default value
            }
		]
	}
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');
var async = require("async");
var opcua = require("node-opcua");
var NodeId = opcua.NodeId;

var when = require('when');
var OPCUAClientObject = require('./LIB/DAISYOPCUAClient');

var OPCUAClientObjectInterface = function() {};
OPCUAClientObjectInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "DAISY_OPCUAClientObject";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        interval: 1000,
        server_adress: "localhost",
        port: 48020,
        object_name: "OPCUAClientObject"
    };
    self.settings.outputs_variables = self.settings.outputs_variables || [];
    self.started = false;

    self.client = new OPCUAClientObject(_app, self.settings.modulesetting.server_adress, self.settings.modulesetting.port, self.settings.name);
    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
OPCUAClientObjectInterface.prototype.start = function() {
    var self = this;
    self.client.connect(self.settings.modulesetting.server_adress, self.settings.modulesetting.port, self.settings.name, function(err) {
        if (err) {
            self.app.engine.log.err("Southbound[" + self.settings.name + "] could not be started !");
        } else {
            self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
        }
        self.started = true;
        self.settings.outputs_variables.forEach(function(el) {
            if (el.nodeId && self.client) {
                self.client.monitorNode(el.nodeId.ns, el.nodeId.nid, el.name, el.interval, function(err) {
                    self.app.engine.log.error("Southbound[" + self.settings.name + "]could not monitor item [" + el.name + "] - [" + el.nodeId.ns + ":" + el.nodeId.nid + "]: " + err);
                }, function(dataValue) {
                    //self.app.engine.log.info("Southbound[" + self.settings.name + "] new Value: " + dataValue.value.value.toString());
                    if (self.started) self.app.inputbus.emit(self.settings.modulesetting.object_name, { name: el.name, value: dataValue.value.value });
                });
            }
        });
    });
    return when.resolve();
};
OPCUAClientObjectInterface.prototype.stop = function() {
    var self = this;
    self.client.disconnect(function(err) {
        if (err) {
            self.app.engine.log.error("Southbound[" + self.settings.name + "] stopped with err: " + err);
        } else {
            self.app.engine.log.info("Southbound[" + self.settings.name + "] stopped successfully!");
        }
        self.started = false;
    });
    delete self.client;

    return when.resolve();
};

module.exports = OPCUAClientObjectInterface;
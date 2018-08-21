/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/northbounds/OPCUAClientStreamer.js
 * Project: SP 142
 * Author:
 *  - Felipe ...
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
 * -- 27.06.2017
 *      Initial implementation
 * --------------------------------------------------------------------
* ###################### Description #####################################
 * OPCUAClientStreamer -- Write to an OPC UA Server, when the value of an input variable changes
 	example_config: {
		id: "OPCUAClientStreamer1", 		// Unique ID of the module in the global configuration
		name: "OPCUAClientStreamer1", 	    // Name of the module instance.
		type: "OPCUAClientStreamer", 	    // Type of the module, should always be "OPCUAClientStreamer" in order to use this module
		modulesetting: {
            server_adress: "localhost",     // Address of the remote opc ua server
			port: 48020, 			        // Remote Port of the opc ua server module
		},
		inputs_variables: [ // The output variables specify how to interpret and map the data received
            {
                name: "Demo.Static.Scalar.Double",      // Input Variable Name
                nodeId: {
                    ns: 4,                              // NamespaceIndex of the variable to monitor
                    nid: "Demo.Static.Scalar.Double"    // NodeId of the opcua variable
                },
                opcuaDataType: 11 (Double,              //( Boolean: 1,SByte:2,Byte :3,Int16: 4, UInt16: 5, Int32: 6, UInt32: 7,Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid:14,
                                                        //ByteString:  15, XmlElement: 16, NodeId: 17, ExpandedNodeId:18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue:23, Variant: 24, DiagnosticInfo:   25 )
                default: 0.0 // Default value
            },
            {
                name: "Demo.Dynamic.Scalar.Float", // Variable Name
                nodeId: {
                    ns: 4, // NamespaceIndex of the variable to monitor
                    nid: "Demo.Static.Scalar.Float" // NodeId of the opcua variable
                },
                opcuaDataType: 11 (Double,              //( Boolean: 1,SByte:2,Byte :3,Int16: 4, UInt16: 5, Int32: 6, UInt32: 7,Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid:14,
                                                        //ByteString:  15, XmlElement: 16, NodeId: 17, ExpandedNodeId:18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue:23, Variant: 24, DiagnosticInfo:   25 )
                default: 0.0 // Default value
            }
		]
	}
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');
var util = require("util");
var async = require("async");
var opcuaclient = require('./LIB/DAISYOPCUAClient');
var opcua = require("node-opcua");

var OpcuaStreamerInterface = function() {
    this.client = null;
    this.endpointUrl = "opc.tcp://localhost:48020";
};

OpcuaStreamerInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "OPCUAClientStreamer";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || { ip: "localhost", port: 48020 };
    self.settings.modulesetting.port = self.settings.modulesetting.port || 48020;
    self.settings.modulesetting.ip = self.settings.modulesetting.ip || "localhost";
    self.settings.inputs_variables = self.settings.inputs_variables || [];

    // Generate the endpoint url
    self.endpointUrl = "opc.tcp://" + self.settings.modulesetting.ip + ":" + self.settings.modulesetting.port;
    self.client = new opcuaclient(_app, self.settings.modulesetting.ip, self.settings.modulesetting.port, self.settings.name);

    //self.fibonacciBackoff.failAfter(10);
    self.app.engine.log.info("Northbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
OpcuaStreamerInterface.prototype.start = function() {
    var self = this;

    async.series(
        [
            function(callback) {
                self.client.connect(self.settings.modulesetting.ip, self.settings.modulesetting.port, self.settings.name, function(err) {
                    if (err) {
                        self.app.engine.log.err("Northbound[" + self.settings.name + "] could not connect to: " + self.endpointUrl);
                    } else {
                        self.app.engine.log.info("Northbound[" + self.settings.name + "] started successfully!");
                    }
                    callback(err);

                });
            },
            function(callback) {
                self.settings.inputs_variables.forEach(function(el) {
                    if (el.name && el.nodeId && self.client) {

                        self.app.outputbus.addListener(el.name, function(arg) {
                            var dataToWrite = { /* dataValue*/
                                sourceTimestamp: Date.now(),
                                sourcePicoseconds: 30,
                                value: {
                                    dataType: el.opcuaDataType,
                                    value: arg
                                }
                            };
                            self.client.write(el.nodeId.ns, el.nodeId.nid, dataToWrite, function(err, statusCode) {
                                console.log(JSON.stringify(statusCode));
                                if (err) {
                                    self.app.engine.log.error("Northbound[" + self.settings.name + " error while writing " + el.name + ". Error:" + JSON.stringify(err));
                                }
                            });
                        });
                    }
                });
                callback(null);
            }
        ],
        function(err) {
            if (err) {
                self.client.disconnect(function() {});
            } else {}
        }
    );

    self.app.engine.log.info("Northbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
OpcuaStreamerInterface.prototype.stop = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.removeAllListeners(el.name);
    });

    self.client.disconnect(function() {});
    delete self.client;

    self.app.engine.log.info("Northbound[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};
OpcuaStreamerInterface.prototype.getSettings = function() {
    var self = this;
    return self.settings;
};

module.exports = OpcuaStreamerInterface;
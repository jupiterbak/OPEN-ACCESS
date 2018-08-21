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
 * WSSStreamer -- Websocket Data Stream
 * This module streams all the data it received on the output bus via websocket to all its clients
 * Below is a configuration example 
    example_config: {
        id: "WSStreamer1", 		// Unique ID of the module in the global configuration
        name: "WSStreamer1", 	    // Name of the module instance.
        type: "WSStreamer", 	    // Type of the module, should always be "WSStreamer" in order to use this module
        modulesetting: {
            port: 8080              // local port of the websocket server.
        },
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
var WebSocketServer = require('ws').Server;

var WSSStreamerInterface = function() {};

WSSStreamerInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "WSStreamer";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || { port: 8080 };
    self.settings.modulesetting.port = self.settings.modulesetting.port || 8080;
    self.settings.inputs_variables = self.settings.inputs_variables || [];

    self.app.engine.log.info("Northbound[" + self.settings.name + "] initialized successfully!");

    // initialize the websocket server
    self.wss = new WebSocketServer({
        port: self.settings.modulesetting.port
    });
    self.wss.on('connection', function connection(ws) {
        self.app.engine.log.info("Northbound[" + self.settings.name + "]--> new Websocket Connection on port: " + self.settings.modulesetting.port + ".");
    });

    self.wss.broadcast = function broadcast(data) {
        self.wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };
    return when.resolve();
};

WSSStreamerInterface.prototype.start = function() {
    var self = this;

    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.addListener(el.name, function(arg) {
            //self.app.engine.log.info("### WSS --> "+ el.name +" : " + arg);
            self.wss.broadcast(JSON.stringify({
                value: arg,
                id: el.name
            }));
        });
    });

    self.app.engine.log.info("Northbound[" + self.settings.name + "] started on port: " + self.settings.modulesetting.port + " successfully!");
    return when.resolve();
};
WSSStreamerInterface.prototype.stop = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.removeAllListeners(el.name);
    });

    //Stop the server
    delete self.wss;

    self.app.engine.log.info("Northbound[" + self.settings.name + "] stoped successfully!");
    return when.resolve();
};
WSSStreamerInterface.prototype.getWss = function() {
    var self = this;
    return self.wss;
};
WSSStreamerInterface.prototype.getSettings = function() {
    var self = this;
    return self.settings;
};
WSSStreamerInterface.prototype.wss = function() {
    var self = this;
    return self.wss;
};

module.exports = WSSStreamerInterface;
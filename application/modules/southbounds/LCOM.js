/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/LCOM.js
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
 * LCOM Client -- Basically a TCP/IP Socket Server 
 example_config: {
    id: "LCOM_Client1",		// Unique ID of the module in the global configuration
    name: "LCOM_Client1", 	// Name of the module instance.
    type: "LCOM", 	        // Type of the module, should always be "LCOM" in order to use this module
    modulesetting: {
        port: 502, 			// Local Port of the Socket server module
        packet_length: 188, // Packet Length, which is the number of byte to be received at each data exchanges
    },
    outputs_variables: [ 	// The output variables specify how to interpret and map the data received
        {
            name: "Portal_Spannung_L1_N", 	// Variable Name
            datatype: "real", 				// Type of the data to read: "real"or "int" (4 Bytes) , "byte" (1 Byte)
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
var net = require('net');

var southboundModuleInterface = function() {};

southboundModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "LCOM";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        port: 3456,
        packet_length: 12
    };
    self.settings.outputs_variables = self.settings.outputs_variables || [];
    // Instantiate the TCP Socket Server
    self._server = net.createServer(function(sock) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] new LCOM connection :" + sock.remoteAddress + ":" + sock.remotePort);

        // Add a 'data' event handler to this instance of socket
        sock.on('data', function(data) {
            //self.data_counter = self.data_counter + 1;
            //self.app.engine.log.info("Southbound[" + self.settings.name + "] " + "DATA " + sock.remoteAddress + " - data = " + data);
            var c = 0;
            self.settings.outputs_variables.forEach(function(el) {
                try {
                    // TODO: Jupiter - Check all type and extract needed bytes
                    var val = data.readFloatBE(c * 4, true);
                    c++;
                    var n = el.name;
                    self.app.inputbus.emit(n, val);
                } catch (err) {
                    self.app.engine.log.info("Southbound[" + self.settings.name + "] Exception :" + err);
                }
            });
        });

        self.data_counter = 0;
        // Add a 'close' event handler to this instance of socket
        sock.on('close', function(data) {
            self.app.engine.log.info("Southbound[" + self.settings.name + "] LCOM connection :" + sock.remoteAddress + ":" + sock.remotePort + " closed.");
        });

        sock.on('error', function(err) {
            self.app.engine.log.info("Southbound[" + self.settings.name + "] LCOM connection :" + sock.remoteAddress + ":" + sock.remotePort + " error: " + err);
        });

    });

    self._server.on('error', function(err) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] LCOM connection :" + sock.remoteAddress + ":" + sock.remotePort + " error: " + err);
    });

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.start = function() {
    var self = this;
    self.data_counter = 0;

    self._server.listen(self.settings.modulesetting.port, function() {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] LCOM Module bound to port " + self.settings.modulesetting.port);
    });

    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();


};
southboundModuleInterface.prototype.stop = function() {
    var self = this;
    self._server.close(function() {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] LCOM Module bound to port " + self.settings.modulesetting.port);
    });

    self.app.engine.log.info("Southbound[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};

module.exports = southboundModuleInterface;
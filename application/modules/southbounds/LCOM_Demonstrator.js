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
 **/

var when = require('when');
var net = require('net');

var southboundModuleInterface = function() {
    this.object_received = {
        name: "LCOM_Demonstrator",
        data: {}
    };
};

southboundModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "LCOM";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        port: 3456,
        packet_length: 0,
        object_name: "LCOM_Demonstrator",
        object_data: {}
    };
    self.settings.modulesetting.port = self.settings.modulesetting.port || 3456;
    self.settings.modulesetting.packet_length = self.settings.modulesetting.packet_length || 0;
    self.settings.modulesetting.object_name = self.settings.modulesetting.object_name || "LCOM_Demonstrator";
    self.settings.modulesetting.object_data = self.settings.modulesetting.object_data || {};

    self.settings.outputs_variables = self.settings.outputs_variables || [];
    // Instantiate the TCP Socket Server
    self._server = net.createServer(function(sock) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] new LCOM connection :" + sock.remoteAddress + ":" + sock.remotePort);

        // Add a 'data' event handler to this instance of socket
        sock.on('data', function(data) {
            //self.data_counter = self.data_counter + 1;
            //self.app.engine.log.info("Southbound[" + self.settings.name + "] " + "DATA " + sock.remoteAddress + " - data = " + data);
            self.object_received.name = self.settings.modulesetting.object_name;
            if (data.length >= self.settings.modulesetting.packet_length) {
                var c = 0;
                self.settings.outputs_variables.forEach(function(el) {
                    try {
                        // TODO: Jupiter - Check all type and extract needed bytes
                        var val = data.readFloatBE(c * 4, true);
                        c++;
                        self.object_received.data[el.name] = val;
                    } catch (err) {
                        self.app.engine.log.info("Southbound[" + self.settings.name + "] Exception :" + err);
                    }
                });
                self.app.inputbus.emit(self.object_received.name, self.object_received);
            }
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
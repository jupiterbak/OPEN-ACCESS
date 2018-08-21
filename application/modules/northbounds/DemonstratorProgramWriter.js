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
 **/

var when = require('when');

// Start the TCP server
const TCP_CLIENT_PORT = 3461;
var tcp_server = require("./ProgramListener/tcp_server.js");

var DemonstratorProgramWriter = function() {};


DemonstratorProgramWriter.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "DemonstratorProgramListener";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || { client_host: '127.0.0.1', client_port: TCP_CLIENT_PORT };
    self.settings.modulesetting.client_host = self.settings.modulesetting.client_host || '127.0.0.1';
    self.settings.modulesetting.client_port = self.settings.modulesetting.client_port || TCP_CLIENT_PORT;
    self.settings.outputs_variables = self.settings.outputs_variables || [];

    // Initialize a tcp_client
    this.mytcpserver = new tcp_server();

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};

DemonstratorProgramWriter.prototype.start = function() {
    var self = this;

    this.mytcpserver.initializeMainClient(self.settings.modulesetting.client_host, self.settings.modulesetting.client_port);
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.addListener(el.name, function(arg) {
            self.mytcpserver.mainClientWrite(arg);
        });
    });

    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};

DemonstratorProgramWriter.prototype.stop = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.removeAllListeners(el.name);
    });

    //Stop the server
    delete self.mytcpserver;
    self.app.engine.log.info("Northbound[" + self.settings.name + "] stoped successfully!");
    return when.resolve();
};

module.exports = DemonstratorProgramWriter;
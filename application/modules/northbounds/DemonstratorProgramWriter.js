/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/dummyClient.js
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
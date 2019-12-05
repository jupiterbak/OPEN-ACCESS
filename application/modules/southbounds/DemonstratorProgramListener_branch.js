/**
 * Copyright 2016 Siemens AG.
 *
 * File: application/modules/southbounds/dummyClient.js
 * Project: SP 142
 * Author:
 *  - Fellipe ...
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
const TCP_SERVER_PORT = 3461;
var tcp_server = require("./ProgramListener/tcp_server.js");

var southboundModuleInterface = function () {
};


southboundModuleInterface.prototype.init = function (_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "DemonstratorProgramListener";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {listener_port: TCP_SERVER_PORT};
    self.settings.modulesetting.listener_port = self.settings.modulesetting.listener_port || TCP_SERVER_PORT;
    self.settings.outputs_variables = self.settings.outputs_variables || [];

    // Initialize a tcp_server
    this.mytcpserver = new tcp_server();
    this.mytcpserver.initializeServer(self.settings.modulesetting.listener_port, function (dataObj) {
        if (dataObj) {
            if (dataObj.err === null) {
                self.settings.outputs_variables.forEach(function (el) {
                    var n = el.name;
                    self.app.inputbus.emit(n, dataObj);
                });
            }
        }
    });

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.start = function () {
    var self = this;
    this.mytcpserver.startServer();
    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.stop = function () {
    var self = this;
    this.mytcpserver.stopServer(function () {
        self.app.engine.log.info("Southbound[" + self.self.settings.name + "] stopped successfully!");
    });
    return when.resolve();
};

module.exports = southboundModuleInterface;
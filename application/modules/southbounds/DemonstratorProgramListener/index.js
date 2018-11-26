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
* ###################### Description #####################################
 * DemonstratorProgramListener -- Below is a configuration example
    
 	example_config: {
		id: "DemonstratorProgramListener1", 		// Unique ID of the module in the global configuration
		name: "DemonstratorProgramListener1", 	    // Name of the module instance.
		type: "DemonstratorProgramListener", 	                    // Type of the module, should always be "DemonstratorProgramListener" in order to use this module
		modulesetting: {
			listener_port:3461, 			// Local Port to listen
			
		},
		outputs_variables: [ 	// The output variables specify how to map the data received
			{
                name: "FAPS_DemonstratorProgramToCloud_Input",  // Variable name
                datatype: "object",
                si_unit: "-",
                default: {}
            }
		]
	}
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');

// Start the TCP server
const TCP_SERVER_PORT = 3461;
var tcp_server = require("./ProgramListener/tcp_server.js");

var southboundModuleInterface = function() {};


southboundModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "DemonstratorProgramListener";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || { listener_port: TCP_SERVER_PORT };
    self.settings.modulesetting.listener_port = self.settings.modulesetting.listener_port || TCP_SERVER_PORT;
    self.settings.outputs_variables = self.settings.outputs_variables || [];

    // Initialize a tcp_server
    this.mytcpserver = new tcp_server();
    this.mytcpserver.initializeServer(self.settings.modulesetting.listener_port, function(dataObj) {
        if (dataObj) {
            if (dataObj.err === null) {
                self.settings.outputs_variables.forEach(function(el) {
                    var n = el.name;
                    self.app.inputbus.emit(n, dataObj);
                });
            }
        }
    });

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.start = function() {
    var self = this;
    this.mytcpserver.startServer();
    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.stop = function() {
    var self = this;
    this.mytcpserver.stopServer(function() {
        self.app.engine.log.info("Southbound[" + self.self.settings.name + "] stopped successfully!");
    });
    return when.resolve();
};

module.exports = southboundModuleInterface;
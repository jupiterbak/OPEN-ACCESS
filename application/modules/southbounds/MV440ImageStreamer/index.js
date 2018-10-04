/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/southbounds/MV440ImageStreamer.js
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
 * MV440ImageStreamer -- A Frame graber for the Siemens MV440 
 example_config: {
    id: "MV440ImageStreamer1",		// Unique ID of the module in the global configuration
    name: "MV440ImageStreamer1", 	// Name of the module instance.
    type: "MV440ImageStreamer",     // Type of the module, should always be "LCOM" in order to use this module
    modulesetting: {
        port: 502, 			// Local Port of the Socket server module
        host: "192.168.1.53", // Ip-Address to bound the socket listener
    },
    outputs_variables: [ 	// The output variables specify how to interpret and map the data received
        {
            name: "ImageFiles", 	// Variable Name
            datatype: "Object", 	// Type of the data to read: always "object"
        }
    ]
}
 *
 * --------------------------------------------------------------------
 **/
var when = require('when');

var stack = require("./lib/ProtocolStack");
var TCPPHY = require("./lib/TCPPHY");
var FrameCollector = require("./lib/FrameCollector");
var FrameDecoder = require("./lib/FrameDecoder");
var IdleFrameFilter = require("./lib/IdleFrameFilter");
var ErrorFrameFilter = require("./lib/ErrorFrameFilter");
var CommandoFrameFilter = require("./lib/ComandoFrameFilter");
var DataFrameFilter = require("./lib/DataFrameFilter");
var PictureFrameFilter = require("./lib/PictureFrameFilter");
var AcknowledgeFrameFilter = require("./lib/AcknowledgeFrameFilter");
var FinishedFrameType = require("./lib/FinishedFrameType");
var frameType = require('./lib/Frame');

var fs = require('fs');


var southboundModuleInterface = function() {
    this.sending = false;
    this.imageCounter = 0;
};

southboundModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "LCOM";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        port: 502, 			// Local Port of the Socket server module
        host: "192.168.1.53" // Ip-Address to bound the socket listener
    };
    self.settings.outputs_variables = self.settings.outputs_variables || [];
    
    // Instantiate the protocol stack
    self.stackInstance = new stack();
    self.stackInstance.addLayer(new TCPPHY(self.settings.modulesetting.port, self.settings.modulesetting.host));
    self.stackInstance.addLayer(new FrameCollector());
    self.stackInstance.addLayer(new FrameDecoder());
    self.stackInstance.addLayer(new IdleFrameFilter());
    self.stackInstance.addLayer(new AcknowledgeFrameFilter());
    self.stackInstance.addLayer(new FinishedFrameType());
    self.stackInstance.addLayer(new ErrorFrameFilter());
    self.stackInstance.addLayer(new CommandoFrameFilter());
    self.stackInstance.addLayer(new DataFrameFilter());
    self.stackInstance.addLayer(new PictureFrameFilter());

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
southboundModuleInterface.prototype.start = function() {
    var self = this;
    self.stackInstance.start(function (params, socket) {
        if (!self.sending) {
            self.stackInstance.transmit(new frameType(frameType.FRAMEHEADERID, params.header.Seq++, frameType.FRAMEHEADERVERSION, frameType.REQUESTFLAG, frameType.CMDSTARTSEND, Buffer.alloc(0)), socket);
            self.sending = true;
        }    
        // save the image    
        if(params.data.length >= 1024 * 768){
            self.settings.outputs_variables.forEach(function(el) {
                try {
                    self.app.inputbus.emit(el.name, {
                        time: new Date(),
                        data:params.data
                    });
                } catch (err) {
                    self.app.engine.log.info("Southbound[" + self.settings.name + "] Exception :" + err);
                }
            });
            
            fs.writeFileSync(__dirname +'/data/image_' + self.imageCounter + '.bmp', params.data);
            self.imageCounter = (self.imageCounter +1)% 10;
        }    
    });

    self.app.engine.log.info("Southbound[" + self.settings.name + "] started successfully!");
    return when.resolve();


};
southboundModuleInterface.prototype.stop = function() {
    var self = this;
    self.stackInstance.stop(function(params) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] stopped successfully!");
    });
    return when.resolve();
};

module.exports = southboundModuleInterface;
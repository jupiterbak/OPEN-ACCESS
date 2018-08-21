/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/northbounds/dummyServer.js
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
 * AMQPOutputStreamer -- AMQP Client that receive data
 	example_config: {
		id: "AMQPOutputStreamer1", 		        // Unique ID of the module in the global configuration
		name: "AMQPOutputStreamer1", 	        // Name of the module instance.
		type: "AMQPOutputStreamer", 	            // Type of the module, should always be "AMQPOutputStreamer" in order to use this module
		modulesetting: {
			server_address: "amqp://esys:esys@131.188.113.59",              // Remote Address of the amqp server module
			exchange:'AMQPStreamer_Exchange_ProgramFromCloud',  // RabbitMQ Exchange, since we used a rabbitMQ Client
            queue:'DemonstratorProgramToCloud'                // RabbitMQ dedicated Que name 
			
		},
		inputs_variables: [ 	// The output variables specify how to interpret and map the data received
			{
                    name: "FAPS_DemonstratorProgramToCloud_Output",    // Name of the variable that will hold the data received
                    datatype: "Object",                                 // All data received will be encapsulated in an object
                    si_unit: "-",
                    default: {}
                }
		]
	}
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');
var util = require("util");
var backoff = require('backoff');
var amqp = require('amqplib/callback_api');

var AMQPStreamerInterface = function() {};

AMQPStreamerInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    this.settings = _settings;
    this.settings.name = this.settings.name || " AMQPOutputStreamer";
    this.settings.id = this.settings.id || util.generateId();
    this.settings.level = this.settings.level || "info";
    this.settings.modulesetting = this.settings.modulesetting || {};
    this.settings.modulesetting.server_address = this.settings.modulesetting.server_address || "amqp://esys:esys@cloud.faps.uni-erlangen.de";
    this.settings.modulesetting.exchange = this.settings.modulesetting.exchange || this.settings.id;
    this.settings.modulesetting.queue = this.settings.modulesetting.queue || 'DemonstratorProgramToCloud';
    this.settings.inputs_variables = this.settings.inputs_variables || [];
    // Initialize the module

    // Initialize the Backoff strategy
    self.fibonacciBackoff = backoff.fibonacci({
        randomisationFactor: 0,
        initialDelay: 1000,
        maxDelay: 30000
    });
    //self.fibonacciBackoff.failAfter(10);


    this.app.engine.log.info("Northbound[" + this.settings.name + "] initialized successfully!");
    return when.resolve();
};
AMQPStreamerInterface.prototype.start = function() {
    var self = this;

    self.fibonacciBackoff.on('backoff', function(number, delay) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] will start connection in : " + delay + 'ms - attempt ' + number + '.');
    });

    self.fibonacciBackoff.on('fail', function() {
        self.app.engine.log.warn("Southbound[" + self.settings.name + "] couldn't connect to: " + self.settings.modulesetting.ip + ' will retry.');
    });

    self.fibonacciBackoff.on('ready', function(number, delay) {
        // connect to brocker
        amqp.connect(self.settings.modulesetting.server_address, function(err, conn) {
            if (err != null) {
                self.app.engine.log.error("Northbound[" + self.settings.name + "] could not connect to: " + self.settings.modulesetting.server_address + " Error: " + JSON.stringify(err));
                self.fibonacciBackoff.backoff();
            } else {
                self.amqp_connection = conn;

                self.amqp_connection.on('error', function(err) {
                    self.app.engine.log.error("Northbound[" + self.settings.name + "] Generated event 'error': " + JSON.stringify(err));
                });

                self.amqp_connection.on('close', function() {
                    self.app.engine.log.warn("Northbound[" + self.settings.name + "] Connection closed.");
                    self.fibonacciBackoff.backoff();
                });

                self.amqp_connection.createChannel(function(err, ch) {
                    self.amqp_ch = ch;
                    self.amqp_ch.assertExchange(self.settings.modulesetting.exchange, 'fanout', { durable: false });

                    self.settings.inputs_variables.forEach(function(el) {
                        self.app.outputbus.addListener(el.name, function(arg) {
                            if (self.amqp_ch) {
                                self.amqp_ch.publish(self.settings.modulesetting.exchange, '', new Buffer(JSON.stringify({
                                    value: arg,
                                    id: el.name,
                                    timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                                })));
                            }
                        });
                    });
                });
            }
        });
    });

    self.fibonacciBackoff.backoff();
    self.app.engine.log.info("Northbound[" + self.settings.name + "] started with server address: " + self.settings.modulesetting.server_address + " successfully!");
    return when.resolve();
};
AMQPStreamerInterface.prototype.stop = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.removeAllListeners(el.name);
    });
    self.fibonacciBackoff.reset();
    //Stop the client
    if (self.amqp_connection) {
        self.amqp_connection.close();
    }
    delete self.amqp_connection;

    self.app.engine.log.info("Northbound[" + self.settings.name + "] stops successfully!");
    return when.resolve();
};
AMQPStreamerInterface.prototype.getAMQPClient = function() {
    return this.amqp_connection;
};
AMQPStreamerInterface.prototype.getSettings = function() {
    return this.settings
};

module.exports = AMQPStreamerInterface;
/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/Southbounds/dummyServer.js
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
 * AMQPInputStreamer -- AMQP Client that receive data
 	example_config: {
		id: "AMQPInputStreamer1", 		        // Unique ID of the module in the global configuration
		name: "AMQPInputStreamer1", 	        // Name of the module instance.
		type: "AMQPInputStreamer", 	            // Type of the module, should always be "AMQPInputStreamer" in order to use this module
		modulesetting: {
			ip: "amqp://esys:esys@131.188.113.59",              // Remote IP-Address of the amqp server module
			exchange:'AMQPStreamer_Exchange_ProgramFromCloud',  // RabbitMQ Exchange, since we used a rabbitMQ Client
            queue:'DemonstratorProgramFromCloud'                // RabbitMQ dedicated Que name 
			
		},
		outputs_variables: [ 	// The output variables specify how to interpret and map the data received
			{
                    name: "FAPS_DemonstratorProgramFromCloud_Input",    // Name of the variable that will hold the data received
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

var AMQPInputStreamerInterface = function() {};

AMQPInputStreamerInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "AMQPInputStreamer";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {};
    self.settings.modulesetting.ip = self.settings.modulesetting.ip || "amqp://esys:esys@cloud.faps.uni-erlangen.de";
    self.settings.modulesetting.exchange = self.settings.modulesetting.exchange || self.settings.id;
    self.settings.modulesetting.queue = self.settings.modulesetting.queue || 'Demonstrator';
    self.settings.outputs_variables = self.settings.outputs_variables || [];

    // Initialize the Backoff strategy
    self.fibonacciBackoff = backoff.fibonacci({
        randomisationFactor: 0,
        initialDelay: 1000,
        maxDelay: 30000
    });
    //self.fibonacciBackoff.failAfter(10);

    self.app.engine.log.info("Southbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
AMQPInputStreamerInterface.prototype.start = function(obj) {
    var self = null;
    if (obj) {
        self = obj;
    } else {
        self = this;
    }

    self.fibonacciBackoff.on('backoff', function(number, delay) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] will start connection in : " + delay + 'ms - attempt ' + number + '.');
    });

    self.fibonacciBackoff.on('fail', function() {
        self.app.engine.log.warn("Southbound[" + self.settings.name + "] couldn't connect to: " + self.settings.modulesetting.ip + ' will retry.');
    });

    self.fibonacciBackoff.on('ready', function(number, delay) {
        try {
            // connect to brocker
            amqp.connect(self.settings.modulesetting.ip, function(err, conn) {
                if (err != null) {
                    self.app.engine.log.warn("Southbound[" + self.settings.name + "] could not connect err: " + JSON.stringify(err));
                    self.fibonacciBackoff.backoff();
                    return;
                }
                self.amqp_connection = conn;
                self.fibonacciBackoff.reset();

                conn.on('error', function(err) {
                    self.app.engine.log.warn("Southbound[" + self.settings.name + "] Generated event 'error': " + JSON.stringify(err));
                    self.fibonacciBackoff.backoff();
                });

                conn.on('close', function() {
                    self.app.engine.log.warn("Southbound[" + self.settings.name + "] Connection closed.");
                    self.fibonacciBackoff.backoff();
                });

                conn.createChannel(function(err, ch) {
                    self.amqp_ch = ch;
                    self.amqp_ch.assertExchange(self.settings.modulesetting.exchange, 'fanout', { durable: false });

                    self.amqp_ch.assertQueue(self.settings.modulesetting.queue, { durable: false }, function(err, q) {
                        if (err) {
                            self.app.engine.log.warn("Southbound[" + self.settings.name + "] could not assert queue err: " + JSON.stringify(err));
                        } else {
                            //console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
                            self.amqp_ch.bindQueue(q.queue, self.settings.modulesetting.exchange, '');

                            self.amqp_ch.consume(q.queue, function(msg) {
                                var data = JSON.parse(msg.content.toString());
                                self.settings.outputs_variables.forEach(function(el) {
                                    var n = el.name;
                                    self.app.inputbus.emit(n, data);
                                });
                                //self.app.engine.log.info("#PROGRAM FROM CLOUD: " + JSON.stringify(data));
                            }, { noAck: true });
                        }

                    });


                    self.app.engine.log.info("Southbound[" + self.settings.name + "] started with ip: " + self.settings.modulesetting.ip + " successfully!");
                });

            });
        } catch (err) {
            self.fibonacciBackoff.backoff();
        }
    });
    self.fibonacciBackoff.backoff();
    return when.resolve();
};
AMQPInputStreamerInterface.prototype.stop = function() {
    var self = this;
    //Stop the client
    if (self.amqp_connection) {
        self.amqp_connection.close();
        delete self.amqp_connection;
    }
    self.fibonacciBackoff.reset();

    self.app.engine.log.info("Southbound[" + self.settings.name + "] stops successfully!");
    return when.resolve();
};
AMQPInputStreamerInterface.prototype.getAMQPClient = function() {
    var self = this;
    return self.amqp_connection;
};
AMQPInputStreamerInterface.prototype.getSettings = function() {
    var self = this;
    return self.settings
};

module.exports = AMQPInputStreamerInterface;
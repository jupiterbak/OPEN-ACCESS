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
 * MQTTStreamer -- MQTTStreamer Data Stream
 * This module streams all the data it received on the output bus via mqtt
 * Below is a configuration example 
    example_config: {
        id: "MQTTStreamer1", 		// Unique ID of the module in the global configuration
        name: "MQTTStreamer1", 	    // Name of the module instance.
        type: "MQTTStreamer", 	    // Type of the module, should always be "MQTTStreamer" in order to use this module
        modulesetting: {
            brokerUrl: "mqtt://test.mosquitto.org:1883"  ,        // MQTT Remote Endpoint
            user: "test",           // Username
            pass: "test"            // Pass
            topic: "MQTT Topic"     // MQTT Topic
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
var MQTT = require('mqtt');
var backoff = require('backoff');

var MQTTStreamerInterface = function() {};

MQTTStreamerInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "MQTTStreamer";
    self.settings.id = self.settings.id || util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        brokerUrl: "mqtt://test.mosquitto.org:1883", // MQTT Remote Endpoint
        user: "test", // Username
        pass: "test" // Pass
    };
    self.settings.modulesetting.brokerUrl = self.settings.modulesetting.brokerUrl || "mqtt://test.mosquitto.org:1883";

    self.settings.modulesetting.topic = self.settings.modulesetting.topic || "MQTT Topic";

    self.settings.inputs_variables = self.settings.inputs_variables || [];

    // Initialize the module
    // Initialize the Backoff strategy
    self.fibonacciBackoff = backoff.fibonacci({
        randomisationFactor: 0,
        initialDelay: 1000,
        maxDelay: 30000
    });
    //self.fibonacciBackoff.failAfter(10);

    self.app.engine.log.info("Northbound[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
MQTTStreamerInterface.prototype.start = function() {
    var self = this;

    self.fibonacciBackoff.on('backoff', function(number, delay) {
        self.app.engine.log.info("Southbound[" + self.settings.name + "] will attempt a new connection in : " + delay + 'ms - attempt ' + number + '.');
    });

    self.fibonacciBackoff.on('fail', function() {
        self.app.engine.log.warn("Southbound[" + self.settings.name + "] couldn't connect to: " + self.settings.modulesetting.brokerUrl + ' will retry.');
    });

    self.fibonacciBackoff.on('ready', function(number, delay) {
        var options = {
            resubscribe: true
        };
        if (self.settings.modulesetting.user && self.settings.modulesetting.pass) {
            options.username = self.settings.modulesetting.user;
            options.password = self.settings.modulesetting.pass;
        }
        // initialize the websocket server
        self.mqtt_client = MQTT.connect(self.settings.modulesetting.brokerUrl, options);

        self.mqtt_client.on('connect', function connection(connack) {
            self.app.engine.log.info("MQTT [" + self.settings.name + "] --> new Connection on ip: " + self.settings.modulesetting.brokerUrl);
            self.fibonacciBackoff.reset();
        });
        self.mqtt_client.on('offline', function connection(err) {
            self.app.engine.log.warn("MQTT [" + self.settings.name + "] Connection to: " + self.settings.modulesetting.brokerUrl + " goes offline. Will try a reconnection.");
            self.fibonacciBackoff.backoff();
        });

        self.mqtt_client.on('error', function connection(err) {
            self.app.engine.log.warn("MQTT [" + self.settings.name + "] cannot connect to : " + self.settings.modulesetting.brokerUrl + " error: " + JSON.stringify(err));
            self.fibonacciBackoff.backoff();
        });

        self.mqtt_client.subscribe('#');
        self.mqtt_client.on('message', function(topic, message) {
            // message is Buffer
            self.app.engine.log.info("Southbound[" + self.settings.name + "] ### MQTT --> " + message.toString());
        });

        self.settings.inputs_variables.forEach(function(el) {
            self.app.outputbus.addListener(el.name, function(arg) {
                self.mqtt_client.publish(self.settings.modulesetting.topic, JSON.stringify({ value: arg, id: el.name }));
            });
        });

    });

    self.fibonacciBackoff.backoff();
    self.app.engine.log.info("Northbound[" + self.settings.name + "] started on port: " + self.settings.modulesetting.port + " successfully!");
    return when.resolve();
};
MQTTStreamerInterface.prototype.stop = function() {
    var self = this;
    self.fibonacciBackoff.reset();
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.removeAllListeners(el.name);
    });

    //Stop the client
    self.mqtt_client.end();
    delete self.mqtt_client;

    self.app.engine.log.info("Northbound[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};
MQTTStreamerInterface.prototype.getMQTTClient = function() {
    var self = this;
    return self.mqtt_client;
};
MQTTStreamerInterface.prototype.getSettings = function() {
    var self = this;
    return self.settings
};

module.exports = MQTTStreamerInterface;
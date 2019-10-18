/**
 * Copyright 2016 Siemens AG.
 *
 * File: application/modules/northbounds/dummyServer.js
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
var util = require("util");

var amqp = require('amqplib/callback_api');

var AMQPStreamerInterface = function () {
};

AMQPStreamerInterface.prototype.init = function (_app, _settings) {
    var self = this;
    this.app = _app;
    this.settings = _settings;
    this.settings.name = this.settings.name || " AMQPStreamer";
    this.settings.id = this.settings.id || util.generateId();
    this.settings.level = this.settings.level || "info";
    this.settings.modulesetting = this.settings.modulesetting || {};
    this.settings.modulesetting.ip = this.settings.modulesetting.ip || "amqp://esys:esys@cloud.faps.uni-erlangen.de";
    this.settings.modulesetting.exchange = this.settings.modulesetting.exchange || this.settings.id;
    this.settings.modulesetting.queue = this.settings.modulesetting.queue || 'DemonstratorProgramToCloud';
    this.settings.outputs_variables = this.settings.outputs_variables || [];
    // Initialize the module

    this.app.engine.log.info("Northbound[" + this.settings.name + "] initialized successfully!");
    return when.resolve();
};
AMQPStreamerInterface.prototype.start = function () {
    var self = this;
    // connect to brocker
    amqp.connect(self.settings.modulesetting.ip, function (err, conn) {
        if (err != null) {
            self.app.engine.log.error(err);
            self.app.engine.log.info("Northbound[" + self.settings.name + "] could not start with ip: " + self.settings.modulesetting.ip);
            return setTimeout(self.start, 1000);
        }
        this.amqp_connection = conn;

        conn.on('error', function (err) {
            self.app.engine.log.info("Northbound[" + self.settings.name + "] Generated event 'error': " + err);
        });

        conn.on('close', function () {
            self.app.engine.log.info("Northbound[" + self.settings.name + "] Connection closed.");
			return setTimeout(self.start, 1000);
        });

        conn.createChannel(function (err, ch) {
            self.amqp_ch = ch;
            self.amqp_ch.assertExchange(self.settings.modulesetting.exchange, 'fanout', {durable: false});

            self.settings.inputs_variables.forEach(function (el) {
                self.app.outputbus.addListener(el.name, function (arg) {
                    if (self.amqp_ch) {
                        self.amqp_ch.publish(self.settings.modulesetting.exchange, '', new Buffer(JSON.stringify({
                            value: arg,
                            id: el.name,
							timestampOnSend: Date.now(),
							timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                        })));
                        //self.app.engine.log.info("### AMQP --> "+ el.name +" : " + arg);
                    }
                });
            });
            self.app.engine.log.info("Northbound[" + self.settings.name + "] started with ip: " + self.settings.modulesetting.ip + " successfully!");
        });

    });
    return when.resolve();
};
AMQPStreamerInterface.prototype.stop = function () {
    var self = this;
    self.settings.inputs_variables.forEach(function (el) {
        self.app.outputbus.removeAllListeners(el.name);
    });

    //Stop the client
    if (self.amqp_connection) {
        self.amqp_connection.close();
        delete self.amqp_connection;
    }

    self.app.engine.log.info("Northbound[" + self.settings.name + "] stops successfully!");
    return when.resolve();
};
AMQPStreamerInterface.prototype.getAMQPClient = function () {
    return this.amqp_connection;
};
AMQPStreamerInterface.prototype.getSettings = function () {
    return this.settings
};

module.exports = AMQPStreamerInterface;
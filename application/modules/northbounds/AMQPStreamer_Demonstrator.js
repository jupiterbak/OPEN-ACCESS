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
 **/

var when = require('when');
var util = require("util");

var amqp = require('amqplib/callback_api');

var AMQPStreamerInterface = function() {
    this.object_to_send = {
        name: "Demonstrator_AMQP_Stream_Data",
        value: { data: {} }
    };
};

AMQPStreamerInterface.prototype.init = function(_app, _settings) {
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
AMQPStreamerInterface.prototype.start = function() {
    var self = this;
    // connect to brocker
    amqp.connect(self.settings.modulesetting.ip, function(err, conn) {
        if (err != null) {
            self.app.engine.log.error(err);
            self.app.engine.log.info("Northbound[" + self.settings.name + "] could not start with ip: " + self.settings.modulesetting.ip);
            return setTimeout(self.start, 1000);
        }
        this.amqp_connection = conn;

        conn.on('error', function(err) {
            self.app.engine.log.info("Northbound[" + self.settings.name + "] Generated event 'error': " + err);
        });

        conn.on('close', function() {
            self.app.engine.log.info("Northbound[" + self.settings.name + "] Connection closed.");
            return setTimeout(self.start, 1000);
        });

        conn.createChannel(function(err, ch) {
            self.amqp_ch = ch;
            self.amqp_ch.assertExchange(self.settings.modulesetting.exchange, 'fanout', { durable: false });
            self.amqp_ch.assertQueue(self.settings.modulesetting.queue, { durable: false });

            self.settings.inputs_variables.forEach(function(el) {
                self.app.outputbus.addListener(el.name, function(arg) {
                    if (self.amqp_ch) {
                        // Merge all properties of the incomming object with the object to send data
                        if (arg.data) {
                            for (var attrname in arg.data) { self.object_to_send.value.data[attrname] = arg.data[attrname]; }
                            self.amqp_ch.publish(self.settings.modulesetting.exchange, '', new Buffer(JSON.stringify({
                                value: self.object_to_send.value,
                                id: self.object_to_send.name,
                                timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                            })));
                            //self.app.engine.log.info("### AMQP --> "+ self.object_to_send.name +" : " + JSON.stringify(self.object_to_send));
                        }
                    }
                });
            });
            self.app.engine.log.info("Northbound[" + self.settings.name + "] started with ip: " + self.settings.modulesetting.ip + " successfully!");
        });

    });
    return when.resolve();
};
AMQPStreamerInterface.prototype.stop = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
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
AMQPStreamerInterface.prototype.getAMQPClient = function() {
    return this.amqp_connection;
};
AMQPStreamerInterface.prototype.getSettings = function() {
    return this.settings
};

module.exports = AMQPStreamerInterface;
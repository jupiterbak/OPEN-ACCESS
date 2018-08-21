/**
 * Copyright 2018 FAPS.
 *
 * File: application/engine/dag/DAG.js
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

var when = require("when");
var clone = require("clone");
var Log = require("../log");
var OpenAccessUtil = require("../util");
var util = require("util");
var containerType = require("../../modules/containers/_container");

function createContainer(config) {
    // get the type
    var moduleSettings = config || {};
    moduleSettings.id = moduleSettings.id || OpenAccessUtil.generateId();
    moduleSettings.name = moduleSettings.name || moduleSettings.id;

    try {
        var sModuleType = require("../../modules/containers/" + moduleSettings.type);
        //sModuleType.init(moduleSettings);
    } catch (error) {
        Log.warn("Container cannot be crated. Container: " + config.name + " - Error: " + error);
        return null;
    }
    util.inherits(sModuleType, containerType);

    var obj_container = new sModuleType(moduleSettings);
    return clone(obj_container);
}

function DAG(settings, engine) {

    this.activeContainers = {};
    this.input_variables = {};
    this.output_variables = {};
    this.basic_inputs = {};
    this.basic_outputs = {};
    this.engine = engine;
    this.started = false;

    this.getContainer = function(id) {
        return this.activeContainers[id];
    };

    this.getActiveContainers = function() {
        return this.activeContainers;
    };

    this.update = function(_flow, engine) {

    };

    this.init = function(flow_config) {
        var self = this;
        this.settings = flow_config || {};
        this.settings.id = this.settings.id || OpenAccessUtil.generateId();
        this.settings.name = this.settings.name || this.settings.id;

        var configContainers = Object.keys(flow_config.containers);
        var pointer;
        var _container_config;
        while (configContainers.length > 0) {
            pointer = configContainers.shift();
            _container_config = flow_config.containers[pointer];

            var obj = createContainer(_container_config);
            obj.init(_container_config);
            if (obj != null) {
                self.activeContainers[obj.id] = obj;
                // get input_variable data streams
                obj.inputsstreams.forEach(function(stream) {
                    if (stream.inputsetting.type === "base_input") {
                        self.basic_inputs[stream.inputsetting.id] = stream;
                    } else {
                        self.input_variables[stream.inputsetting.variable] = self.input_variables[stream.inputsetting.variable] || [];
                        self.input_variables[stream.inputsetting.variable].push(stream);
                    }
                });

                obj.outputsstreams.forEach(function(stream) {
                    if (stream.outsetting.type === "base_output") {
                        self.basic_outputs[stream.outsetting.id] = stream;
                    } else {
                        self.output_variables[stream.outsetting.variable] = self.input_variables[stream.outsetting.variable] || [];
                        self.output_variables[stream.outsetting.variable].push(stream);
                    }
                });
            }
        }
    };

    this.start = function(app) {
        var self = this;
        self.started = true;
        // start all containers
        var keys = Object.keys(this.activeContainers);
        for (var i = 0; i < keys.length; i++) {
            var container = this.activeContainers[keys[i]];
            container.start();
        }


        // Connect the inputs to the outputs
        Object.keys(self.input_variables).forEach(function(keyi) {
            var streami_s = self.input_variables[keyi];


            var output_list = self.output_variables[keyi];
            if (output_list) {
                streami_s.forEach(function(s) {
                    output_list.forEach(function(streamo_) {
                        streamo_.on('data', function(arg) {
                            s.write(arg);
                            //streami_.emit(streamo_.outsetting.variable, arg);
                        });

                    });
                });
            }

            Object.keys(self.basic_outputs).forEach(function(keyo) {
                if (self.basic_outputs[keyo].outsetting.variable === keyi) {
                    self.basic_outputs[keyo].on('data', function(arg) {
                        streami_s.forEach(function(s) {
                            s.write(arg);
                        });
                    });
                }
            });


            Object.keys(self.basic_inputs).forEach(function(keyii) {
                if (self.basic_inputs[keyii].inputsetting.variable === keyi) {
                    self.basic_inputs[keyii].on('data', function(arg) {
                        streami_s.forEach(function(s) {
                            s.write(arg);
                        });
                    });
                }
            });
        });



        // Connect the basic output to the output event bus
        Object.keys(this.basic_outputs).forEach(function(key) {
            var streami = self.basic_outputs[key];
            streami.on('data', function(arg) {
                app.outputbus.emit(streami.outsetting.variable, arg);
            });
        });

        // Connect the basic input to the input event bus
        Object.keys(this.basic_inputs).forEach(function(key) {
            app.inputbus.addListener(self.basic_inputs[key].inputsetting.variable, function(val) {
                self.basic_inputs[key].write(val);
            });
        });
    };

    this.stop = function(app) {
        var self = this;
        self.started = false;
        Object.keys(this.basic_inputs).forEach(function(key) {
            app.inputbus.removeListener(self.basic_inputs[key].inputsetting.variable, function(val) {
                self.basic_inputs[key].write(val);
            });
        });

        Object.keys(this.basic_outputs).forEach(function(key) {
            var streami = self.basic_outputs[key];
            streami.on('data', function(arg) {
                //app.outputbus.emit(streami.outsetting.variable, arg);
            });
        });

        // start all containers
        var keys = Object.keys(this.activeContainers);
        for (var i = 0; i < keys.length; i++) {
            var container = this.activeContainers[keys[i]];
            container.stop();
        }
    };

    this.addContainer = function(app, container_settings) {
        var state;
        state = this.started;

        // Check the container settings
        var c_settings = container_settings || {};
        c_settings.id = c_settings.id || OpenAccessUtil.generateId();
        c_settings.name = c_settings.name || c_settings.id;

        if (this.started) this.stop();
        var new_setting = clone(this.settings);

        // add the new container
        new_setting.containers[c_settings.id] = c_settings;

        this.init(new_setting);
        if (state) this.start(app);

    };

    this.removeContainer = function(app, container_id) {
        var state;
        state = this.started;

        // Check the container settings
        var c_settings = container_id || "";

        if (this.started) this.stop();
        var new_setting = clone(this.settings);

        // Get the target config
        var r_config = new_setting.containers[container_id];
        if (!r_config) {
            Log.warn("Container does not exist in the DAG. Container: " + container_id);
        } else {
            delete new_setting.containers[container_id];
        }

        // Reinitialize
        this.init(new_setting);

        // Restart the
        if (state) this.start(app);
    };

    this.handleStatus = function(node, statusMessage) {

    };

    this.handleError = function(node, logMessage, msg) {

    };

}

module.exports = {
    create: function(settings, engine) {
        return new DAG(settings, engine);
    }
};
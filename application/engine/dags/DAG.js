/**
 * Copyright 2018 FAPS.
 *
 * File: application/engine/dag/DAG.js
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
        // TODO: Jupiter
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
                var keys = Object.keys(obj.inputsstreams);
                for (var i = 0; i < keys.length; i++) {
                    var stream = obj.inputsstreams[keys[i]];
                    if (stream.inputsetting.type === "base_input") {
                        self.basic_inputs[stream.inputsetting.variable] = self.basic_inputs[stream.inputsetting.variable] || [];
                        self.basic_inputs[stream.inputsetting.variable].push(stream);
                    } else {
                        self.input_variables[stream.inputsetting.variable] = self.input_variables[stream.inputsetting.variable] || [];
                        self.input_variables[stream.inputsetting.variable].push(stream);
                    }
                }

                var keys2 = Object.keys(obj.outputsstreams);
                for (var j = 0; j < keys2.length; j++) {
                    var stream = obj.outputsstreams[keys2[j]];
                    if (stream.outsetting.type === "base_output") {
                        self.basic_outputs[stream.outsetting.variable] = self.basic_outputs[stream.outsetting.variable] || []
                        self.basic_outputs[stream.outsetting.variable].push(stream);
                    } else {
                        self.output_variables[stream.outsetting.variable] = self.input_variables[stream.outsetting.variable] || [];
                        self.output_variables[stream.outsetting.variable].push(stream);
                    }
                }
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


        // Connect the inputs variable to the base input or output variables
        Object.keys(self.input_variables).forEach(function(keyi) {
            var streami_s = self.input_variables[keyi];

            // Connect to the output variables
            var output_list = self.output_variables[keyi];
            if (output_list) {
                output_list.forEach(function(streamo_) {
                    streamo_.on('data', function(arg) {
                        streami_s.forEach(function(s) {
                            s.write(arg);
                        });
                    });
                });
            }

            var is_base_input = false;
            is_base_input = streami_s.length > 0 && streami_s[0].inputsetting.type === "base_input";
            if (is_base_input) {
                // Connect to the base input
                var base_input_list = self.basic_inputs[keyi];
                if (base_input_list) {
                    base_input_list.forEach(function(b_input) {
                        if (b_input.inputsetting.variable === keyi) {
                            b_input.on('data', function(arg) {
                                streami_s.forEach(function(s) {
                                    s.write(arg);
                                });

                            });
                        }
                    });
                }
            }

            var is_base_output = false;
            is_base_output = streami_s.length > 0 && streami_s[0].inputsetting.type === "base_output";
            if (is_base_output) {
                // Connect to the base output 
                var base_output_list = self.basic_outputs[keyi];
                if (base_output_list) {
                    base_output_list.forEach(function(b_output) {
                        if (b_output.outsetting.variable === keyi) {
                            b_output.on('data', function(arg) {
                                streami_s.forEach(function(s) {
                                    s.write(arg);
                                });

                            });
                        }
                    });
                }
            }
        });

        // Connect the basic input to the input event bus
        Object.keys(this.basic_inputs).forEach(function(key) {
            var binputlist = self.basic_inputs[key];
            if (binputlist) {
                app.inputbus.addListener(key, function(val) {
                    //console.log("Base INPUT " + key + " = " + val);
                    binputlist.forEach(element => {
                        element.write(val);
                    });

                });
            }
        });

        // Connect the basic output to the output event bus
        Object.keys(this.basic_outputs).forEach(function(key) {
            var boutputlist = self.basic_outputs[key];
            if (boutputlist) {
                boutputlist.forEach(streami => {
                    streami.on('data', function(arg) {
                        //console.log("Base OUTPUT " + key + " = " + arg);
                        app.outputbus.emit(streami.outsetting.variable, arg);

                    });
                });
            }
        });
    };

    this.stop = function(app) {
        var self = this;
        self.started = false;
        Object.keys(this.basic_inputs).forEach(function(key) {
            var binputlist = self.basic_inputs[key];
            if (binputlist) {
                app.inputbus.removeListener(key, function(val) {
                    binputlist.forEach(element => {
                        element.write(val);
                    });
                });
            }
        });

        Object.keys(this.basic_outputs).forEach(function(key) {
            var boutputlist = self.basic_outputs[key];
            if (boutputlist) {
                boutputlist.forEach(streami => {
                    streami.on('data', function(arg) {
                        //app.outputbus.emit(streami.outsetting.variable, arg);
                    });
                });
            }
        });

        // stop all containers
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
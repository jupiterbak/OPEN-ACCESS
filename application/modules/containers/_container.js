/**
 * Copyright 2018 FAPS.
 *
 * File: open_access.js
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
'use strict';

var util = require("util");
var transform = require('stream').Transform;
var when = require("when");
var clone = require("clone");

var OpenAccessUtil = require("../../engine/util");
var Log = require("../../engine/log");


function StreamDuplex(options) {
    if (!(this instanceof StreamDuplex))
        return new StreamDuplex(options);
    transform.call(this, options);
}
util.inherits(StreamDuplex, transform);

StreamDuplex.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
};

function Container(settings) {
    this.settings = settings;
    this.id = settings.id || OpenAccessUtil.generateId();
    this.type = settings.type;
    this.inputs = settings.inputs;
    this.outputs = settings.outputs;
    this.inputs_values = [];
    this.outputs_values = [];
    this._closeCallbacks = [];
    this.started = false;
    this.inputs_configs = [];
    this.outputs_configs = [];

    if (settings.name) {
        this.name = settings.name;
    }
    if (settings._alias) {
        this._alias = settings._alias;
    }
}



Container.prototype.init = function(settings) {
    this.settings = settings;
    this.id = settings.id || OpenAccessUtil.generateId();
    this.type = settings.type;
    this.inputs = settings.inputs;
    this.outputs = settings.outputs;
    this.inputs_values = [];
    this.outputs_values = [];
    this.inputsstreams = {};
    this.outputsstreams = {};
    this.started = false;

    this._closeCallbacks = [];

    if (settings.name) {
        this.name = settings.name;
    }
    if (settings._alias) {
        this._alias = settings._alias;
    }
    this.updateWires(settings);
};

Container.prototype.updateWires = function(settings) {
    //console.log("UPDATE",this.id);
    var self = this;
    this.inputs = settings.inputs || [];
    this.outputs = settings.outputs || [];
    this.inputs_values = {};
    this.outputs_values = {};
    this.inputsstreams = {};
    this.outputsstreams = {};

    // Compare configuration and settings
    if (this.inputs.length != this.inputs_configs.length || this.outputs.length != this.outputs_configs.length) {
        this.error("Configuration doesn't match type: Container " + this.settings.id);
        var e = new Error("Configuration doesn't match type: Container " + this.settings.id);
        throw e;
    }

    // Check if all inputs were defined and the data type matches
    this.inputs_configs.forEach(function(input) {
        var founded = false;
        self.inputs.forEach(element => {
            if (element.name) {
                if (input.name === element.name) {
                    founded = true;
                    if (input.datatype !== element.datatype) {
                        self.error("Input " + self.settings.name + "." + element.name + " doesn't have the same type as " + self.settings.type + "." + input.name + ". Please check your configuration file.");
                        var e2 = new Error("Input " + self.settings.name + "." + element.name + " doesn't have the same type as " + self.settings.type + "." + input.name + ". Please check your configuration file.");
                        throw e2;
                    }
                }
            } else {
                self.error("Container input has no name property. Container: " + self.settings.name + ". Please check your configuration file.");
                var e = new Error("Container input has no name property: Container " + self.settings.name + ". Please check your configuration file.");
                throw e;
            }
        });

        if (founded === false) {
            self.error("Input \"" + input.name + "\" was not found in the container definition. Container: " + self.settings.name + ", Container type: " + self.settings.type);
            var e1 = new Error("Input \"" + input.name + "\" was not found in the container definition. Container: " + self.settings.name + ", Container type: " + self.settings.type);
            throw e1;
        }
    });

    // Check if all outputs were defined and the data type matches
    this.outputs_configs.forEach(function(output) {
        var founded = false;
        self.outputs.forEach(element => {
            if (element.name) {
                if (output.name === element.name) {
                    founded = true;
                    if (output.datatype !== element.datatype) {
                        self.error("Output " + self.settings.name + "." + element.name + " doesn't have the same type as " + self.settings.type + "." + output.name + ". Please check your configuration file.");
                        var e2 = new Error("Output " + self.settings.name + "." + element.name + " doesn't have the same type as " + self.settings.type + "." + output.name + ". Please check your configuration file.");
                        throw e2;
                    }
                }
            } else {
                self.error("Container output has no name property. Container: " + self.settings.name + ". Please check your configuration file.");
                var e = new Error("Container output has no name property: Container " + self.settings.name + ". Please check your configuration file.");
                throw e;
            }
        });

        if (founded === false) {
            self.error("Output \"" + output.name + "\" was not found in the container definition. Container: " + self.settings.name + ", Container type: " + self.settings.type);
            var e1 = new Error("Output \"" + output.name + "\" was not found in the container definition. Container: " + self.settings.name + ", Container type: " + self.settings.type);
            throw e1;
        }
    });

    var i = 0;
    this.inputs.forEach(function(input) {
        if (!input.id) {
            input.id = OpenAccessUtil.generateId();
        }
        self.inputs_values[self.inputs_configs[i].name] = input.default; //.push(input.default);
        var obj0 = new StreamDuplex({ objectMode: true });
        obj0.inputsetting = input;
        obj0.inputsetting.container = self.id;
        obj0.inputsetting.container_input = self.inputs_configs[i];
        //self.inputsstreams.push(obj0);
        self.inputsstreams[self.inputs_configs[i].name] = obj0;
        i++;
    });

    var j = 0;
    this.outputs.forEach(function(output) {
        if (!output.id) {
            output.id = OpenAccessUtil.generateId();
        }
        self.outputs_values[self.outputs_configs[j].name] = output.default;
        var obj = new StreamDuplex({ objectMode: true });
        obj.outsetting = output;
        obj.outsetting.container = self.id;
        obj.outsetting.container_output = self.outputs_configs[j];
        //self.outputsstreams.push(obj);
        self.outputsstreams[self.outputs_configs[j].name] = obj;
        j++;
    });
};

Container.prototype.start = function() {
    var self = this;
    self.started = true;
    Object.keys(self.inputsstreams).forEach(function(key) {
        var stream_start = self.inputsstreams[key];
        stream_start.on('data', function(value) {
            self.inputs_values[stream_start.inputsetting.container_input.name] = value;
            // Computation start every time the data on the inputs change.
            // TODO: may be a better way???? e.g. only compute when all the variables changes?
            self.computeAll();
        });
    });
}
Container.prototype.stop = function() {
    var self = this;
    this.started = false;
    Object.keys(self.inputsstreams).forEach(function(key) {
        var stream_start = self.inputsstreams[key];
        stream_start.on('data', function(value) {
            self.inputs_values[stream_start.inputsetting.container_input.name] = value;
            //self.computeAll();
        });
    });
};

Container.prototype.computeAll = function() {
    var self = this;
    this.compute(this.inputs_values, this.outputs_values);
    this.updateOutputs();
};

Container.prototype.compute = function(input_datas, output_datas) {
    this.warn("Container is not implemented: " + this.settings.id);
};

Container.prototype.updateOutputs = function(input_datas, output_datas) {
    var self = this;
    Object.keys(self.outputsstreams).forEach(function(key) {
        var stream = self.outputsstreams[key];
        stream.write(self.outputs_values[stream.outsetting.container_output.name]);
    });
};

function log_helper(self, level, msg) {
    var o = {
        level: level,
        id: self.id,
        type: self.type,
        msg: msg
    };
    if (self.name) {
        o.name = self.name;
    }
    Log.log(o);
}

Container.prototype.log = function(msg) {
    log_helper(this, Log.INFO, msg);
};

Container.prototype.warn = function(msg) {
    log_helper(this, Log.WARN, msg);
};

Container.prototype.error = function(msg) {
    log_helper(this, Log.ERROR, msg);
};

Container.prototype.addInput = function(name, label, datatype, si_unit, default_value) {
    this.inputs_configs.push({
        name: name,
        label: label,
        datatype: datatype,
        si_unit: si_unit,
        default: default_value
    });
};

Container.prototype.addOutput = function(name, label, datatype, si_unit, default_value) {
    this.outputs_configs.push({
        name: name,
        label: label,
        datatype: datatype,
        si_unit: si_unit,
        default: default_value
    });
};

Container.prototype.error = function(logMessage, msg) {
    logMessage = logMessage || "";
    log_helper(this, Log.ERROR, logMessage);
    if (msg) {
        //flows.handleError(this,logMessage,msg);
    }
};

/**
 * status: { fill:"red|green", shape:"dot|ring", text:"blah" }
 */
Container.prototype.status = function(status) {
    // TODO: Jupiter
    //flows.handleStatus(this,status);
};

module.exports = Container;
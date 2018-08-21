/**
 * Created by Administrator on 01.12.2016.
 */

var when = require("when");
var clone = require("clone");
var Log = require("../../engine/log");
var OpenAccessUtil = require("../../engine/util");
var util = require("util");
var containerType = require("../containers/_container");

function createContainer(config) {
    // get the type
    var moduleSettings = config || {};
    moduleSettings.id = moduleSettings.id || OpenAccessUtil.generateId();
    moduleSettings.name = moduleSettings.name || moduleSettings.id;

    try {
        var sModuleType = require("../containers/"+ moduleSettings.type);
        //sModuleType.init(moduleSettings);
    } catch (error) {
        Log.warn("Container cannot be crated. Container: " + config.name + " - Error: " + error);
        return null;
    }
    util.inherits(sModuleType, containerType);

    var obj_container = new sModuleType(moduleSettings);
    return clone(obj_container);
}

function DAG(settings,engine) {

    this.activeContainers = {};
    this.input_variables = {};
    this.output_variables = {};
    this.basic_inputs = {};
    this.basic_outputs = {};
    this.engine = engine;

    this.getNode = function (id) {
        return activeNodes[id];
    };

    this.getActiveNodes = function () {
        return activeNodes;
    };

    this.update = function (_flow, engine) {

    };

    this.init = function (flow_config) {
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
                obj.inputsstreams.forEach(function (stream) {
                    if (stream.inputsetting.type === "base_input") {
                        self.basic_inputs[stream.inputsetting.id] = stream;
                    } else {
                        self.input_variables[stream.inputsetting.variable] = self.input_variables[stream.inputsetting.variable] || [];
                        self.input_variables[stream.inputsetting.variable].push(stream);
                    }
                });

                obj.outputsstreams.forEach(function (stream) {
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

    this.start = function () {
        // Connect The basic output to the output event bus

        // Connect the basic input to the input event bus
        this.basic_inputs.forEach(function (stream) {
            //this.engine.inputbus
        })
    };

    this.stop = function (stopList) {

    };

    this.handleStatus = function (node, statusMessage) {

    };

    this.handleError = function (node, logMessage, msg) {

    };

}

module.exports = {
    create: function(settings,engine) {
        return new DAG(settings,engine);
    }
}

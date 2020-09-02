/**
 * Copyright 2019 FAPS.
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
 * -- 01.05.2019
 *      Initial implementation
 * --------------------------------------------------------------------
 * ###################### Description #####################################
 * MindsphreLibStreamer -- Mindsphere Client to push data to mindsphere
 	example_config: {
		id: "MindsphreLibStreamer1", 		        // Unique ID of the module in the global configuration
		name: "MindsphreLibStreamer0", 	        // Name of the module instance.
		type: "MindsphreLibStreamer", 	            // Type of the module, should always be "MindsphreLibStreamer" in order to use this module
		modulesetting: {
			configuration: "amqp://esys:esys@131.188.113.59",              // JSON Configuration of the agent
            object_name: 'MINDSPHERE_Stream_Object',     // Name of the object that holds all values. This attribute is required
            datapoint_mapping: [
                                { "dataPointId": "1557293223444", "qualityCode": "0", "name": "P1" },
                                { "dataPointId": "1557294045308", "qualityCode": "0", "name": "P1" },
                                { "dataPointId": "1557293154631", "qualityCode": "0", "name": "P1" },
                                { "dataPointId": "1557293273534", "qualityCode": "0", "name": "P1" },
                                { "dataPointId": "1557293295599", "qualityCode": "0", "name": "P1" }
            ],
            interval: 1000                                        // Time interval (ms) to transfer the data to the cloud
        }
	}
 *
 * --------------------------------------------------------------------
 **/
"use strict";
var when = require('when');
var util = require("util");
var mindconnect_nodejs_1 = require("@mindconnect/mindconnect-nodejs");
Object.defineProperty(exports, "__esModule", { value: true });

var _shouldStop = false;
var valuesQueues = [];

// **** Type cript generated connection engine
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    return new(P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }

        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }

        function step(result) { result.done ? resolve(result.value) : new P(function(resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] },
        f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;

    function verb(n) { return function(v) { return step([n, v]); }; }

    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return { value: op[1], done: false };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [6, e];
            y = 0;
        } finally { f = t = 0; }
        if (op[0] & 5) throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __start = (this && this.__start) || function(_configurationPath, _timeout, _module_log) {
    return __awaiter(this, void 0, void 0, function() {
        var sleep, configuration, agent, log, RETRYTIMES, index, _loop_1, i, err_1;
        return __generator(this, function(_a) {
            switch (_a.label) {
                case 0:
                    sleep = function(ms) { return new Promise(function(resolve) { return setTimeout(resolve, ms); }); };
                    configuration = require(__dirname + "/mindsphere_config/" + _configurationPath);
                    agent = new mindconnect_nodejs_1.MindConnectAgent(configuration);
                    log = function(text) { _module_log("" + text.toString()); };
                    RETRYTIMES = 5;
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (_shouldStop) return [3 /*break*/ , 14];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 12, , 13]);
                    //log("Iteration : " + index);
                    if (!!agent.IsOnBoarded()) return [3 /*break*/ , 4];
                    // wrapping the call in the retry function makes the agent a bit more resilliant
                    // if you don't want to retry the operations you can always just call await agent.OnBoard(); instaead.
                    return [4 /*yield*/ , mindconnect_nodejs_1.retry(RETRYTIMES, function() { return agent.OnBoard(); })];
                case 3:
                    // wrapping the call in the retry function makes the agent a bit more resilliant
                    // if you don't want to retry the operations you can always just call await agent.OnBoard(); instaead.
                    _a.sent();
                    log("Mindsphere Agent onboarded.");
                    _a.label = 4;
                case 4:
                    if (!!agent.HasDataSourceConfiguration()) return [3 /*break*/ , 6];
                    return [4 /*yield*/ , mindconnect_nodejs_1.retry(RETRYTIMES, function() { return agent.GetDataSourceConfiguration(); })];
                case 5:
                    _a.sent();
                    log("Configuration aquired");
                    _a.label = 6;
                case 6:
                    _loop_1 = function(i) {
                        var values = [];
                        return __generator(this, function(_a) {
                            switch (_a.label) {
                                case 0:
                                    if (values.length === 0 && valuesQueues.length > 0) {
                                        values = valuesQueues.slice();
                                        valuesQueues = [];
                                    }
                                    if (values.length > 0) {
                                        return [4 /*yield*/ , mindconnect_nodejs_1.retry(RETRYTIMES, function() { return agent.PostData(values); })];
                                    } else {
                                        [4 /*yield*/ , sleep(1000)];
                                    }
                                case 1:
                                    _a.sent();
                                    log("Data posted --> Attempt Nr. " + i);
                                    return [4 /*yield*/ , sleep(1000)];
                                case 2:
                                    _a.sent();
                                    values = [];
                                    return [2 /*return*/ ];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 7;
                case 7:
                    if (i > 0 || _shouldStop) return [3 /*break*/ , 10];
                    return [5 /*yield**/ , _loop_1(i)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/ , 7];
                case 10:
                    //log("Data posted end.");
                    return [4 /*yield*/ , sleep(1000)];
                case 11:
                    _a.sent();
                    return [3 /*break*/ , 13];
                case 12:
                    err_1 = _a.sent();
                    // add proper error handling (e.g. store data somewhere, retry later etc. )
                    console.error(err_1);
                    return [3 /*break*/ , 13];
                case 13:
                    index++;
                    return [3 /*break*/ , 1];
                case 14:
                    return [2 /*return*/ ];
            }
        });
    });
};

var MindsphereStreamerInterface = function() {
    this.IntervalTimeout = null;
};
MindsphereStreamerInterface.prototype.getDataPointId = function(key) {
    var self = this;
    for (let index = 0; index < self.settings.modulesetting.datapoint_mapping.length; index++) {
        const element = self.settings.modulesetting.datapoint_mapping[index];
        if (element.name === key) {
            return element.dataPointId;
        }
    }
    return "";
};

MindsphereStreamerInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    this.settings = _settings;
    this.settings.name = this.settings.name || " MindsphreLibStreamer";
    this.settings.id = this.settings.id || util.generateId();
    this.settings.level = this.settings.level || "info";
    this.settings.modulesetting = this.settings.modulesetting || {};
    this.settings.modulesetting.configuration = this.settings.modulesetting.configuration || "";
    this.settings.modulesetting.interval = this.settings.modulesetting.interval || 1000;
    this.settings.modulesetting.object_name = this.settings.modulesetting.object_name || "MINDSPHERE_Stream_Object";
    this.settings.modulesetting.datapoint_mapping = this.settings.modulesetting.datapoint_mapping || [];
    // Initialize the module
    this.app.engine.log.info("Northbound[" + this.settings.name + "] initialized successfully!");
    return when.resolve();
};

var _getIndex = function(array, key) {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.dataPointId === key) {
            return index;
        }
    }

    return -1;
};

MindsphereStreamerInterface.prototype.start = function() {
    var self = this;

    // collect all the variables in the object 'self.settings.modulesetting.object_name'    
    self.app.outputbus.addListener(self.settings.modulesetting.object_name, function(argObject) {
        var value = argObject.value;
        var _dataPointId = self.getDataPointId(argObject.name);
        if (_dataPointId !== "") {
            // Check for uniqueness
            var _elIndex = _getIndex(valuesQueues, _dataPointId);
            if (_elIndex >= 0) {
                valuesQueues[_elIndex] = { "dataPointId": _dataPointId, "qualityCode": "0", "value": argObject.value.toString() };
            } else {
                valuesQueues.push({ "dataPointId": _dataPointId, "qualityCode": "0", "value": argObject.value.toString() });
            }
        }
    });

    var _log = function(_mtext) { self.app.engine.log.info("Northbound[" + self.settings.name + "] " + _mtext); };
    __start(this.settings.modulesetting.configuration, this.settings.modulesetting.interval, _log);

    self.app.engine.log.info("Northbound[" + self.settings.name + "] started with configuration : " + this.settings.modulesetting.configuration + " successfully!");
    return when.resolve();
};
MindsphereStreamerInterface.prototype.stop = function() {
    var self = this;
    _shouldStop = true;
    self.app.engine.log.info("Northbound[" + self.settings.name + "] stops successfully!");
    return when.resolve();
};

module.exports = MindsphereStreamerInterface;
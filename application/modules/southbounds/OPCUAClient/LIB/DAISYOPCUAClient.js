/**
 * Copyright 2018 Siemens AG.
 * 
 * File: LEMS.js
 * Project: SP 164
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
 * -- 10.02.2018
 *      Initial implementation
 * --------------------------------------------------------------------
 **/
"use strict";
var colors = require('colors');
var opcua = require("node-opcua");
var async = require("async");
var md5 = require('md5');

var regexGUID = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
var isValidGuid = function(guid) {
    return regexGUID.test(guid);
};

var guidtest = function(nodeId) {

    var type;
    if (isValidGuid(nodeId)) {
        type = "g";
    } else if (isNaN(nodeId)) {
        type = "s";
    } else {
        type = "i";
    }
    return type;
};

/*#####################################################################################*/
/* OPC UA CLIENT OBJECT
 /*#####################################################################################*/
/**
 * @class DAISYOPCClient
 * @constructor
 */
var DAISYOPCClient = function(_app, ip, port, serverName) {
    if (ip === undefined) {
        err = "Ip addresse is not valid.";
        return;
    }
    if (port === undefined || port === 0) {
        err = "Port is not valid.";
        return;
    }
    if (serverName === undefined) {
        err = "serverName is not valid.";
        return;
    }

    this.servername = serverName;
    this.ip = ip;
    this.port = port;
    this.app = _app;

    var options = {
        applicationName: "SP164_ENERGY_DEMONSTRATOR",
        endpoint_must_exist: false,
        connectionStrategy: {
            maxRetry: 200,
            initialDelay: 5000,
            maxDelay: 30000
        },
        securityMode: opcua.MessageSecurityMode.get("NONE"),
        securityPolicy: opcua.SecurityPolicy.get("None"),
        requestedSessionTimeout: 20000,
        //serverCertificate: serverCertificate,
        defaultSecureTokenLifetime: 40000,
        keepSessionAlive: true
    };

    this.client = new opcua.OPCUAClient(options);
    this.connected = false;
    this.session = null;
    this.subscription = null;
    this.monitoredItems = [];
    this.monitoredEvents = [];
    this.namespaceArray = ["http://opcfoundation.org/UA/"];
};

DAISYOPCClient.prototype.getNamespaceIndexOfURI = function(uri) {
    for (let i = 0; i < this.namespaceArray.length; i++) {
        if (this.namespaceArray[i] === uri) {
            return i;
        }
    }
    return 0;
};

DAISYOPCClient.prototype.getID = function() {
    return md5(this.ip + "_" + this.port + "_" + this.servername);
};

//var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/SampleServer";
DAISYOPCClient.prototype.connect = function(ip, port, serverName, fCallback) {
    var err = "";
    // Fehlerbehandlung
    if (ip === undefined) {
        err = "Ip addresse is not valid.";
        fCallback(err);
        return;
    }
    if (port === undefined || port === 0) {
        err = "Port is not valid.";
        fCallback(err);
        return;
    }
    if (serverName === undefined) {
        err = "serverName is not valid.";
        fCallback(err);
        return;
    }

    this.servername = serverName;
    this.ip = ip;
    this.port = port;
    this.url = "opc.tcp://" + ip + ":" + port;

    var self = this;

    async.series([ // step 1 : connect to
            function(callback) {
                var url = "opc.tcp://" + ip + ":" + port;
                self.client.on("timed_out_request ", function() {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] timed_out_request.");
                    self.connected = false;
                });
                self.client.on("start_reconnection", function() {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] start_reconnection.");
                    self.connected = false;
                });
                self.client.on("connection_reestablished", function() {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] connection_reestablished.");
                    self.connected = true;
                });
                self.client.on("close", function() {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] Connection closed.");
                    self.connected = false;
                });
                self.client.on("backoff", function(nb, delay) {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "]  connection failed for the " + nb +
                        " time ... We will retry in " + delay + " ms");
                    self.connected = false;
                });
                self.client.connect(url, function(err) {
                    if (err) {
                        self.app.engine.log.info("OPC UA Client [" + self.servername + "] Cannot connect to endpoint : " + url);
                        self.connected = false;
                    } else {
                        self.app.engine.log.info("OPC UA Client [" + self.servername + "] Connected to: " + url);
                        self.connected = true;
                    }
                    callback(err);
                });
            },
            // step 2 : createSession
            function(callback) {
                self.client.createSession(function(err, session) {
                    if (!err) {
                        self.session = session;
                        self.app.engine.log.info("OPC UA Client [" + self.servername + "] new session created.");
                        callback();
                    } else {
                        callback(err);
                    }
                });
            },

            // step 3: initialize a subscription
            function(callback) {

                self.subscription = new opcua.ClientSubscription(self.session, {
                    requestedPublishingInterval: 10,
                    requestedLifetimeCount: 60000,
                    requestedMaxKeepAliveCount: 2000,
                    maxNotificationsPerPublish: 1000,
                    publishingEnabled: true,
                    priority: 1
                });

                self.subscription.on("started", function() {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] subscription started.");
                    callback();
                }).on("keepalive", function() {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] subscription keep alive.");
                }).on("terminated", function() {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] subscription terminated.");
                    self.subscription = null;
                    callback();
                }).on("internal_error", function(err) {
                    self.app.engine.log.info("OPC UA Client [" + self.servername + "] subscription internal_error: " + JSON.stringify(err));
                    callback(err);
                    self.subscription = null;
                });
            },
            // Get Namespace Array
            function(callback) {
                self.readData(0, 2255, function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        self.namespaceArray = result[0].value.value;
                        callback();
                    }
                });
            }
        ],
        function(err) {
            if (err) {
                if (self.session) {
                    //self.client.disconnect(function () { });
                }
                //console.log(" failure ", err);
                self.connected = false;
            } else {
                //console.log("Async Done!");
                self.connected = true;
            }
            fCallback(err)
        });
    //console.log("lul".blue);
};

/**
 * browse a node.
 *
 * @method browse
 * @async
 *
 *
 * @param ns {String}
 * @param nid {String}
 * @param {Function} fCallback
 * @param fCallback.err - Error.
 * @param {BrowseResult[]} fCallback.results an array containing the BrowseResult of each BrowseDescription.
 */
DAISYOPCClient.prototype.browseNode = function(ns, nid, fCallback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    var type = guidtest(nid);
    var browseDescription = [{
        nodeId: "ns=" + ns + ";" + type + "=" + nid,
        referenceTypeId: "HierarchicalReferences",
        browseDirection: 0, //opcua.BrowseDirection.Forward
        includeSubtypes: true,
        nodeClassMask: 0,
        resultMask: 63
    }];
    this.session.browse(browseDescription, function(err, browse_result) {
        if (!err) {
            fCallback(err, browse_result);
        } else {
            fCallback(err, browse_result);
        }
    });
};

/**
 * browse a node array.
 *
 * @method browseNodes
 * @async
 *
 *
 * @param nodes {Object}
 * @param {Function} fCallback
 * @param fCallback.err - Error.
 * @param {BrowseResult[]} fCallback.results an array containing the BrowseResult of each BrowseDescription.
 */
DAISYOPCClient.prototype.browseNodes = function(nodes, fCallback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    this.session.browse(nodes, function(err, browse_result) {
        if (!err) {
            fCallback(err, browse_result);
        } else {
            fCallback(err, browse_result);
        }
    });
};

/**
 * browse a node array.
 *
 * @method browseNodeByReferenceType
 * @async
 *
 *
 * @param ns {String}
 * @param nid {String}
 * @param nName {String}
 * @param referenceTypeId {String}
 * @param {Function} fCallback
 * @param fCallback.err {Error|null}   - the Error if the async method has failed
 * @param {BrowseResult[]} fCallback.results an array containing the BrowseResult of each BrowseDescription.
 */
DAISYOPCClient.prototype.browseNodeByReferenceType = function(ns, nid, referenceTypeId, fCallback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }
    var type = guidtest(nid);

    var browseDescription = [{
        nodeId: "ns=" + ns + ";" + type + "=" + nid,
        referenceTypeId: referenceTypeId, //"HasTypeDefinition",
        browseDirection: 0, //opcua.BrowseDirection.Forward
        includeSubtypes: true,
        nodeClassMask: 0,
        resultMask: 63
    }];

    this.session.browse(browseDescription, function(err, browse_result) {
        if (!err) {
            fCallback(err, browse_result);
        } else {
            fCallback(err, browse_result);
        }
    });
};

/**
 * browse a node by specifying the reference type and the browse direction.
 *
 * @method browseNodeByReferenceTypAndDirection
 * @async
 *
 *
 * @param ns {String}
 * @param nid {String}
 * @param nName {String}
 * @param browseDirection {integer}
 * @param referenceTypeId {String}
 * @param {Function} fCallback
 * @param fCallback.err {Error|null}   - the Error if the async method has failed
 * @param {BrowseResult[]} fCallback.results an array containing the BrowseResult of each BrowseDescription.
 */
DAISYOPCClient.prototype.browseNodeByReferenceTypAndDirection = function(ns, nid, browseDirection = 0, referenceTypeId = "HierarchicalReferences") {
    let self = this;
    let err = "";
    let result = {}
        // TODO; fehlerbehandlung
    return new Promise((resolve, reject) => {
        if (self.session === undefined) {
            err = "Session is not opened.";
            reject(err);
        }

        let type = guidtest(nid);
        let browseDescription = [{
            nodeId: "ns=" + ns + ";" + type + "=" + nid,
            referenceTypeId: referenceTypeId,
            browseDirection: browseDirection, //opcua.BrowseDirection.Forward
            includeSubtypes: true,
            nodeClassMask: 0,
            resultMask: 63
        }];
        self.session.browse(browseDescription, (err, browse_result) => {
            if (!err) {
                result.err = err
                result.browse_result = browse_result
                resolve(browse_result);
            } else {
                result.err = err
                reject(err);
            }
        });
    }).catch(e => console.log(e))
};

DAISYOPCClient.prototype.browseNodeBack = function(ns, nid) {
    let berr = "";
    // TODO; fehlerbehandlung
    let result = {}
    let self = this
    return new Promise((resolve, reject) => {
        if (self.session === undefined) {
            berr = "Session is not opened.";
            reject(berr);

        }
        let type = guidtest(nid);
        let browseDescription = [{
            nodeId: "ns=" + ns + ";" + type + "=" + nid,
            referenceTypeId: "HierarchicalReferences",
            browseDirection: 1, //opcua.BrowseDirection.Backwards
            includeSubtypes: true,
            nodeClassMask: 0,
            resultMask: 63
        }];
        self.session.browse(browseDescription, function(err, browse_result) {
            if (!err) {
                result.err = err
                result.browse_result = browse_result
                resolve(browse_result);
            } else {
                result.err = err
                reject(err);
            }
        });
    }).catch(e => console.log(e))
};

DAISYOPCClient.prototype.browseNonHieriarchicalRef = function(ns, nid) {
    var berr = "";
    // TODO; fehlerbehandlung
    return new Promise((resolve, reject) => {
        if (this.session === undefined) {
            berr = "Session is not opened.";
            reject(berr);

        }

        var type = guidtest(nid);
        var browseDescription = [{
            nodeId: "ns=" + ns + ";" + type + "=" + nid,
            referenceTypeId: "NonHierarchicalReferences",
            browseDirection: 0, //opcua.BrowseDirection.Forward
            includeSubtypes: true,
            nodeClassMask: 0,
            resultMask: 63
        }];
        this.session.browse(browseDescription, function(err, browse_result) {
            if (!err) {
                resolve(browse_result);
            } else {
                reject(err);
            }
        });
    }).catch(e => console.log(e))
};

/**
 * @method readData
 * @async
 * @param ns {String} - The namespace index of the node
 * @param nid {String} - the nodeId
 * @param {Function} callback -   the callback function
 */
DAISYOPCClient.prototype.readData = function(ns, nid, callback) {
    var max_age = 0;
    var type = guidtest(nid);
    var nodes_to_read = [
        { nodeId: "ns=" + ns + ";" + type + "=" + nid, attributeId: opcua.AttributeIds.Value }
    ];
    this.session.read(nodes_to_read, max_age, function(err, nodeToRead, dataValues) {
        callback(err, dataValues);
    });
};

/**
 * @method readNodesData
 * @async
 * @param nodes  {ReadValueId[]} - the read value id
 * @param {Function} callback -   the callback function
 */
DAISYOPCClient.prototype.readNodesData = function(nodes, callback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        callback(berr, null);
        return;
    }
    this.session.readVariableValue(nodes, function(err, nodes_to_read, dataValues) {
        callback(err, dataValues);
    });
};

/**
 * @method readNodesHistoryValue
 * @async
 * @example:
 *
 *     client.readNodesHistoryValue("ns=5;s=Simulation Examples.Functions.Sine1","2015-06-10T09:00:00.000Z","2015-06-10T09:01:00.000Z",function(err,dataValues,diagnostics) {} );
 *
 * @param nodes  {ReadValueId[]} - the read value id
 * @param start - the startTime in UTC format
 * @param end - the endTime in UTC format
 * @param {Function} callback -   the callback function
 * @param callback.err {object|null} the error if write has failed or null if OK
 * @param callback.results {DataValue[]} - an array of dataValue each read
 */
DAISYOPCClient.prototype.readNodesHistoryValue = function(nodes, start, end, callback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        callback(berr, null);
        return;
    }
    this.session.readHistoryValue(nodes, start, end, function(err, nodes_to_read, dataValues) {
        if (!err) {
            callback(dataValues);
        } else {
            callback(dataValues);
        }
    });
};


/**
 * @async
 * @method write
 *
 * @param ns {String} - The namespace index of the node
 * @param nid {String} - the nodeId
 * @param value   {Variant} - the value to write
 * @param {Function} callback -   the callback function
 * @param callback.err {object|null} the error if write has failed or null if OK
 */
DAISYOPCClient.prototype.write = function(ns, nid, value, callback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        callback(berr, null);
        return;
    }

    var type = guidtest(nid);
    var nodes_to_write = "ns=" + ns + ";" + type + "=" + nid;

    var nodesToWrite = [{
        nodeId: nodes_to_write,
        attributeId: opcua.AttributeIds.Value,
        indexRange: null,
        value: value
    }];

    this.session.write(nodesToWrite, function(err, statusCode) {
        callback(err, statusCode);
    });
};

/**
 * @async
 * @method writeNodes
 * @param nodesToWrite {Array.<WriteValue>}  - the array of value to write. One or more elements.
 *
 * @param {Function} callback -   the callback function
 * @param callback.err {object|null} the error if write has failed or null if OK
 */
DAISYOPCClient.prototype.writeNodes = function(nodesToWrite, callback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        callback(berr, null);
        return;
    }
    this.session.write(nodesToWrite, function(err, statusCode) {
        callback(err, statusCode);
    });
};

/**
 * @method readAllAttributes
 *
 * @example:
 *
 *    ``` javascript
 *    client.readAllAttributes("2","Furnace_1.Temperature",function(err,nodesToRead,dataValues) {} );
 *    ```
 *
 * @async
 * @param ns {String} - The namespace index of the node
 * @param nid {String} - the nodeId
 * @param callback              {Function} - the callback function
 * @param callback.err          {Error|null} - the error or null if the transaction was OK
 * @param callback.nodesToRead  {ReadValueId[]}
 * @param callback.results      {DataValue[]}
 * @param callback.diagnostic  {DiagnosticInfo[]}
 *
 */
DAISYOPCClient.prototype.readAllAttributes = function(ns, nid, callback) {
    var type = guidtest(nid);
    var nodes_to_read = "ns=" + ns + ";" + type + "=" + nid;

    this.session.readAllAttributes(nodes_to_read, function(err, nodesToRead, dataValues, diagnostics) {
        callback(err, nodesToRead, dataValues, diagnostics);
    });
};

DAISYOPCClient.prototype.readVariableValue = function(ns, nid, callback) {
    var type = guidtest(nid);

    this.session.readVariableValue("ns=" + ns + ";" + type + "=" + nid, function(err, dataValue) {
        callback(err, dataValue);
    });
};

/**
 *
 * @method monitorNode
 * @async
 *
 * @param ns {String} - The namespace index of the node
 * @param nid {String} - the nodeId
 * @param browseName {String} - the nodeId
 * @param samplingInterval {integer} - the sampling Interval
 * @param fCallback {Function}
 * @param fCallback.err {Error|null}   - the Error if the async method has failed
 * @param newValueCallback {Function}
 * @param newValueCallback.dataValue {null}   - the new value of the monitored node variable
 */
DAISYOPCClient.prototype.monitorNode = function(ns, nid, browseName, samplingInterval, fCallback, newValueCallback) {
    var self = this;
    var mErr = "";

    // Fehlerbehandlung
    if (this.session === undefined) {
        mErr = "Session is not opened.";
        fCallback(mErr);
        return;
    }

    var type = guidtest(nid);
    //console.log(this.monitoredItems["ns=" + ns + ";" + type + "=" + nid]);
    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid] = this.subscription.monitor({
            nodeId: opcua.resolveNodeId("ns=" + ns + ";" + type + "=" + nid),
            attributeId: 13
        }, {
            samplingInterval: samplingInterval,
            discardOldest: true,
            queueSize: 100
        },
        opcua.read_service.TimestampsToReturn.Both);

    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid].on("changed", function(dataValue) {

        newValueCallback(dataValue);

    });
    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid].on("initialized", function() {
        //console.log("monitoredItem initialized");
    });
    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid].on("err", function(err) {
        self.app.engine.log.err("OPC UA Client [" + self.servername + "] monitoring err of" + self.monitoredItems["ns=" + ns + ";" + type + "=" + nid].itemToMonitor.nodeId.toString() + " err: " + JSON.stringify(err));
        fCallback(err);
    });
};

/**
 *
 * @method getMonitoredItems
 * @async
 *
 * @param callback {Function}
 * @param callback.err {Error|null}   - the Error if the async method has failed
 * @param callback.monitoredItems {Array}
 */
DAISYOPCClient.prototype.getMonitoredItems = function(callback) {
    var mErr = "";

    // TODO; fehlerbehandlung
    if (this.session === undefined) {
        mErr = "Session is not opened.";
        callback(mErr, this.monitoredItems);
        return;
    }
    callback(null, this.monitoredItems);
};


DAISYOPCClient.prototype.monitorNodeEvent = function(ns, nid, browseName, samplingInterval, fCallback, newValueCallback) {
    var self = this;
    var mErr = "";

    // TODO; fehlerbehandlung
    if (this.session === undefined) {
        mErr = "Session is not opened.";
        fCallback(mErr);
        return;
    }

    var type = guidtest(nid);
    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid] = this.subscription.monitor({
            nodeId: opcua.resolveNodeId("ns=" + ns + ";" + type + "=" + nid),
            attributeId: 12 // AttributeIds.EventNotifier
        }, {
            queueSize: 1,
            filter: new opcua.subscription_service.EventFilter({
                selectClauses: [ // SimpleAttributeOperand
                    {
                        typeId: "ns=4;i=10002", // NodeId of a TypeDefinitionNode.
                        browsePath: [{ name: "EventId" }],
                        attributeId: 13 //AttributeIds.Value
                    }
                ],
                whereClause: { //ContentFilter
                }
            }),

            discardOldest: true
        },
        opcua.read_service.TimestampsToReturn.Both
    );


    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid].on("changed", function(dataValue) {
        newValueCallback(dataValue);
    });
    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid].on("initialized", function() {
        fCallback();
    });
    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid].on("err", function(err) {
        self.app.engine.log.err("OPC UA Client [" + self.servername + "] monitoring err of" + self.monitoredItems["ns=" + ns + ";" + type + "=" + nid].itemToMonitor.nodeId.toString() + " err: " + JSON.stringify(err));
        fCallback(err);
    });
};


/**
 *
 * @method deleteMonitoredItem
 * @async
 * @param ns {String} - The namespace index of the node
 * @param nid {String} - the nodeId
 * @param fCallback {Function}
 * @param fCallback.err {Error|null}   - the Error if the async method has failed
 */
DAISYOPCClient.prototype.unmonitorNode = function(ns, nid, fCallback) {
    var self = this;
    var mErr = "";

    // TODO; fehlerbehandlung
    if (this.session === undefined) {
        mErr = "Session is not opened.";
        fCallback(mErr);
        return;
    }
    var type = guidtest(nid);
    this.subscription._delete_monitored_item({
            nodeId: opcua.resolveNodeId("ns=" + ns + ";" + type + "=" + nid),
            attributeId: 13 // Value
        },
        function(err) {
            if (err) {
                fCallback(err);
            } else {
                delete self.monitoredItems["ns=" + ns + ";" + type + "=" + nid];
                fCallback(null);
            }
        });
};

DAISYOPCClient.prototype.disconnect = function(fCallback) {
    var self = this;
    var dErr = "";

    // TODO; fehlerbehandlung
    if (this.session === undefined) {
        dErr = "Session is not opened.";
        fCallback(dErr);
        return;
    }
    self.app.engine.log.err("OPC UA Client [" + self.servername + "] start disconnection.");
    async.series(
        [ // step 1 : disconnect to
            function(callback) {
                var url = "opc://" + self.ip + ":" + self.port;
                self.client.disconnect(function(err) {
                    if (err) {
                        self.app.engine.log.err("OPC UA Client [" + self.servername + "] Cannot disconnect from endpoint :" + url);
                    } else {
                        self.app.engine.log.err("OPC UA Client [" + self.servername + "] disconnected from endpoint :" + url);
                    }
                    callback(err);
                });
            }
        ],
        function(err) {
            if (err) {
                //console.log(" failure ", err);
            } else {
                //console.log("Async Done!");
            }
            fCallback(err);
            self.app.engine.log.err("OPC UA Client [" + self.servername + "] Connection Terminated .");
        }
    );
};

/**
 *
 * @returns {Boolean}
 */
DAISYOPCClient.prototype.hasBeenClosed = function() {
    return this.client.hasBeenClosed();
};

/**
 *
 * @returns {Boolean}
 */
DAISYOPCClient.prototype.close = function(fcallback) {
    var self = this;
    async.series(
        [ // step 1 : close session
            function(callback) {
                self.client.closeSession(self.session, true, function(err) {
                    callback(err);
                });
            },
            // step 2 : disconnect
            function(callback) {
                self.client.disconnect(function(err) {
                    self.app.engine.log.err("OPC UA Client [" + self.servername + "] Connection Terminated .");
                    callback(err);
                });
            }
        ],
        function(err) {
            fcallback(err);
        }
    );
};


/**
 * extract the argument definition of a method
 * @method getArgumentDefinition
 * @param ns {String} - The namespace index of the node
 * @param methodNodeId {String} - the nodeId
 * @param callback  {Function}
 * @param {Error|null} callback.err
 * @param {Argument<>} callback.inputArguments
 * @param {Argument<>} callback.outputArguments
 */
DAISYOPCClient.prototype.getArgumentDefinition = function(ns, methodNodeId, callback) {
    var mErr = "";

    // TODO; fehlerbehandlung
    if (this.session === undefined) {
        mErr = "Session is not opened.";
        callback(mErr, null, null);
        return;
    }

    var type = guidtest(methodNodeId);
    var method_nodes_to_read = "ns=" + ns + ";" + type + "=" + methodNodeId;

    this.session.getArgumentDefinition(method_nodes_to_read, function(err, inputArguments, outputArguments) {
        callback(err, inputArguments, outputArguments);
    });
};


/**
 *
 * @method callMethod
 *
 * @param object_ns {String} - The namespace index of the node representing the object will method will be called
 * @param objectNodeId {String} - the nodeId of the node representing the the object will method will be called
 * @param method_ns {String} - The namespace index of the node representing the method to call
 * @param methodNodeId {String} - the nodeId of the node representing the method to call
 * @param methodsToCall {CallMethodRequest[]} the call method request array
 * @param callback {Function}
 * @param callback.err {Error|null}
 * @param callback.response {CallMethodResult[]}
 *
 *
 * @example :
 *
 * var inputArguments = [
 *         new Variant({...}),
 *         new Variant({...}),
 *  ];
 * session.callMethod("2","12","2","13",inputArguments,function(err,response) {
 *    if (!err) {
 *         var rep = response[0];
 *         console.log(" statusCode = ",rep.statusCode);
 *         console.log(" inputArgumentResults[0] = ",rep.inputArgumentResults[0].toString());
 *         console.log(" inputArgumentResults[1] = ",rep.inputArgumentResults[1].toString());
 *         console.log(" outputArgument[0]       = ",rep.outputArgument[0].toString()); // array of variant
 *    }
 * });
 */
DAISYOPCClient.prototype.callMethod = function(object_ns, objectNodeId, method_ns, methodNodeId, inputArguments, callback) {
    var mErr = "";

    // TODO; Fehlerbehandlung
    if (this.session === undefined) {
        mErr = "Session is not opened.";
        callback(mErr, null);
        return;
    }

    // Parse and prepare ObjectNodeId
    var type_object = guidtest(objectNodeId);
    var object_nodes_to_call = "ns=" + object_ns + ";" + type_object + "=" + objectNodeId;

    var type = guidtest(methodNodeId);
    var method_nodes_to_call = "ns=" + method_ns + ";" + type + "=" + methodNodeId;

    // Initialize the method call request
    var methodsToCall = [{
        objectId: object_nodes_to_call,
        methodId: method_nodes_to_call,
        inputArguments: inputArguments
    }];


    this.session.call(methodsToCall, function(err, response) {
        callback(err, response);
    });
};

module.exports = DAISYOPCClient;
/**
 * Created by Administrator on 18.01.2017.
 */

var colors = require('colors');
var opcua = require("node-opcua");
var guidtest = require("./guidtest.js");
var async = require("async");
var color = require("colors");
var md5 = require('md5');
var portfinder = require('portfinder');
portfinder.basePort = 9000;

var targetNameSpaceUri = "http://siemens.com/CM_PMA/";

/*#####################################################################################*/
/* OPC UA CLIENT OBJECT		
 /*#####################################################################################*/

var DAISYOPCClient = function (ip, port, servername) {
    this.servername = servername;
    this.ip = ip;
    this.port = port;

    this.socketHandler = null;
    this.targetNameSpace = 2;
    this.targetNodeID = 5654; // Start at Object PRESSESIMULATOR
    this.locked = false;
    this.schema = null;
    var self = this;
    portfinder.getPort(function (err, port) {
        if(!err){
            self.socketHandler = require('socket.io').listen(port);
        }
    });

    var options = {
        securityMode: opcua.MessageSecurityMode.get("NONE"),
        securityPolicy: opcua.SecurityPolicy.get("None"),
        requestedSessionTimeout: 20000000,
        //serverCertificate: serverCertificate,
        defaultSecureTokenLifetime: 40000
    };

    this.client = new opcua.OPCUAClient(options);
    this.session = null;
    this.subscription = null;
    this.monitoredItems = [];
    this.monitoredEvents = [];

    this.CMFunctions = [];
    this.CMMonitoredItems = {};
};

DAISYOPCClient.prototype.getID = function () {
    return md5( this.ip + "_" + this.port + "_" + this.servername);
};

//var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/SampleServer";
DAISYOPCClient.prototype.connect = function (ip, port, servername,  fCallback) {
    var err = "";

    // TODO: fehlerbehandlung
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
    if (servername === undefined) {
        err = "servername is not valid.";
        fCallback(err);
        return;
    }

    this.servername = servername;
    this.ip = ip;
    this.port = port;

    var self = this;

    console.log("Open new OPC Client to " + servername);
    async.series([ // step 1 : connect to
            function (callback) {
                var url = "opc.tcp://" + ip + ":" + port;
                self.client.connect(url, function (err) {
                    if (err) {
                        console.log(" Cannot connect to endpoint :".red, ip);
                    } else {
                        console.log(" Connected to: ".green + url.green);
                        self.socketHandler.emit('state', self.getID() + "_connectedToServer");
                        //eventEmitter.emit("connectedToServer");
                    }
                    callback(err);
                });
            },
            // step 2 : createSession
            function (callback) {
                self.client.createSession(function (err, session) {
                    if (!err) {
                        self.session = session;
                        console.log(" session created - sessionId =".yellow, session.sessionId.toString());
                        self.socketHandler.emit('state', self.getID() + "_SessionCreated");
                        callback();
                    } else {
                        callback(err);
                    }

                });
            }
            ,
            // step 4: get namespace of DAISY Model uri
            function (callback) {

                var server_NamespaceArray_Id = opcua.resolveNodeId("ns=0;i=2255"); // ns=0;i=2006

                self.session.readVariableValue(server_NamespaceArray_Id, function (err, dataValue, diagnosticsInfo) {

                    console.log(" --- NAMESPACE ARRAY ---");
                    if (!err) {
                        var namespaceArray = dataValue.value.value;
                        for (var i = 0; i < namespaceArray.length; i++) {
                            if (namespaceArray[i] === targetNameSpaceUri) {
                                console.log(" Namespace ", i, "  : ", namespaceArray[i].green, " --> OK FOUND".bold.green);
                                self.targetNameSpace = i;
                            } else {
                                console.log(" Namespace ", i, "  : ", namespaceArray[i]);
                            }
                        }
                    }
                    console.log(" -----------------------");
                    callback(err);
                });
            }

            ,
            // step 3: initilize a subscription
            function (callback) {

                self.subscription = new opcua.ClientSubscription(self.session, {
                    requestedPublishingInterval: 200,
                    requestedLifetimeCount: 6000,
                    requestedMaxKeepAliveCount: 2000,
                    maxNotificationsPerPublish: 10,
                    publishingEnabled: true,
                    priority: 10
                });

                function getTick() {
                    return Date.now();
                }
                var t = getTick();

                self.subscription.on("started", function () {
                    console.log(" subscription started - subscriptionId =", self.subscription.subscriptionId);
                    self.socketHandler.emit('state',self.getID() + "_SubscriptionStarted");
                    callback();
                }).on("keepalive", function () {
                    var t1 = getTick();
                    var span = t1 - t;
                    t = t1;
                    console.log(" keepalive ", span / 1000, "sec", " pending request on server = ", self.subscription.publish_engine.nbPendingPublishRequests);
                    self.socketHandler.emit('state',self.getID() + "_SubscriptionKeepalive");
                }).on("terminated", function () {
                    self.socketHandler.emit('state',elf.getID() + "_SubscriptionTerminated");
                    self.subscription = null;
                    callback();
                }).on("internal_error", function (err) {
                    self.socketHandler.emit('state',self.getID() + "_SubscriptionTerminated");
                    callback(err);
                    self.subscription = null;
                });
            }
        ],
        function (err) {
            if (err) {
                if (self.session) {
                    self.client.disconnect(function () {
                    });
                }
                //console.log(" failure ", err);
            } else {
                //console.log("Async Done!");
            }
            fCallback(err)
        });
};

DAISYOPCClient.prototype.disconnect = function (ip, port, servername, fCallback) {
    var err = "";
    var self = this;
    // TODO; fehlerbehandlung

    console.log("Disconnect OPC Client to " + servername);
    async.series(
        [ // step 1 : disconnect to
            function (callback) {
                var url = "opc://" + ip + ":" + port;
                self.client.disconnect(url, function (err) {
                    if (err) {
                        console.log("Cannot connect to endpoint :".red, url);
                    } else {
                        console.log("disonnected to: ".green + url.green);
                        self.socketHandler.emit('state',self.self.getID() + "_ConnectionTerminated");
                    }
                    callback(err);
                });
            }
        ],
        function (err) {
            if (err) {
                //console.log(" failure ", err);
            } else {
                //console.log("Async Done!");
            }
            fCallback(err);
            self.socketHandler.emit('state',self.self.getID() + "_ConnectionTerminated");
        }
    );
};


DAISYOPCClient.prototype.browseNode = function (ns, nid, nName, fCallback) {
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    var type = guidtest(nid);
    this.session.browse("ns=" + ns + ";" + type + "=" + nid, function (err, browse_result) {
        fCallback(err, browse_result);
    });
};

DAISYOPCClient.prototype.monitorNode = function (ns, nid, browseName, samplingInterval, fCallback, newValueCallback) {
    var self = this;
    var merr = "";

    // TODO; fehlerbehandlung
    if (this.session === undefined) {
        merr = "Session is not opened.";
        fCallback(merr);
        return;
    }

    var type = guidtest(nid);
    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid] = this.subscription.monitor(
        {
            nodeId: opcua.resolveNodeId("ns=" + ns + ";" + type + "=" + nid),
            attributeId: 13
        },
        {
            samplingInterval: samplingInterval,
            discardOldest: true,
            queueSize: 10
        },
        opcua.read_service.TimestampsToReturn.Both);

    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid].on("changed", function (dataValue) {
        newValueCallback(dataValue);
    });
    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid].on("initialized", function () {
        fCallback(null);
    });
    this.monitoredItems["ns=" + ns + ";" + type + "=" + nid].on("err", function (err) {
        console.log(self.monitoredItems["ns=" + ns + ";" + type + "=" + nid].itemToMonitor.nodeId.toString(), " ERROR".red, err);
        fCallback(err);
    });
};

DAISYOPCClient.prototype.monitorNodeEvent = function (ns, nid, browseName, samplingInterval, fCallback, newValueCallback) {
    var self = this;
    var merr = "";

    // TODO; fehlerbehandlung
    if (this.session === undefined) {
        merr = "Session is not opened.";
        fCallback(err);
        return;
    }

    var type = guidtest(nid);
    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid] = this.subscription.monitor(
        {
            nodeId: opcua.resolveNodeId("ns=" + ns + ";" + type + "=" + nid),
            attributeId: 12 // AttributeIds.EventNotifier
        },
        {
            queueSize: 1,
            filter: new opcua.subscription_service.EventFilter({
                selectClauses: [// SimpleAttributeOperand
                    {
                        typeId: "ns=4;i=10002", // NodeId of a TypeDefinitionNode.
                        browsePath: [{name: "EventId"}],
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


    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid].on("changed", function (dataValue) {
        newValueCallback(dataValue);
    });
    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid].on("initialized", function () {
        //console.log("monitoredItem initialized");
        fCallback(null);
    });
    this.monitoredEvents["ns=" + ns + ";" + type + "=" + nid].on("err", function (err) {
        console.log(self.monitoredItems["ns=" + ns + ";" + type + "=" + nid].itemToMonitor.nodeId.toString(), " ERROR".red, err);
        fCallback(err);
    });
};

DAISYOPCClient.prototype.unmonitorNode = function (ns, nid, browseName, samplingInterval, fCallback) {
    // TODO
    var self = this;
    var merr = "";

    fCallback(merr);
};

DAISYOPCClient.prototype.getID = function () {
    return md5( this.ip + "_" + this.port + "_" + this.servername);
};

DAISYOPCClient.prototype.findCMFunctionsObjects = function (startNodeNS, startNodeID, startNodeName, results, praefix, fCallback, eCallback) {
    //console.log("Continue search findCMFunctionsObjects ######\n");
    var self = this;
    var berr = "";
    // TODO; fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    this.browseNode(startNodeNS, startNodeID, startNodeName, function (err, browse_result) {
        //console.log("Continue search browseNode ######\n");
        var rslt = {error: null};
        if (err) {
            rslt.error = err.message;
            rslt.nodes = null;
            //console.log("Continue search browseNode Errror: "+ err + "\n");
            eCallback(err);
        } else {
            if (browse_result) {
                if (browse_result[0].references) {
                    browse_result[0].references.forEach(function (item) {
                        if (
                            ( item.isForward && item.typeDefinition.namespace === self.targetNameSpace && item.typeDefinition.value === 1099) || // Condition Monitoring Aggregation Function
                            ( item.isForward && item.typeDefinition.namespace === self.targetNameSpace && item.typeDefinition.value === 1097)    // Condition Monitoring Base Function
                        ) {
                            var tmp_key = "" + praefix + "-" + item.browseName.name;
                            var val = {};
                            val['path'] = tmp_key;
                            val['node'] = item;
                            self.CMFunctions.push(val);
                            if (results) {
                                //console.log("Found Node -->" + item + "\n".green);
                                if (results["" + praefix + "-" + item.browseName.name] === undefined) {
                                    results["" + praefix + "-" + item.browseName.name] = [];
                                }
                            }
                            self.findCMFunctionsObjectsFeaturesFolder(item.nodeId.namespace, item.nodeId.value, item.nodeId.value, tmp_key, self.CMFunctions[self.CMFunctions.length - 1], function (feature) {
                                if (results) {
                                    results["" + praefix + "-" + item.browseName.name].push(feature);
                                }
                            }, function (err) {

                            });

                            self.findCMFunctionsSystemStates(item.nodeId.namespace, item.nodeId.value, item.nodeId.value, tmp_key, self.CMFunctions[self.CMFunctions.length - 1], function (systemState) {
                                console.log("FeatureSystemStateCallBack Node -->" + tmp_key.yellow + "_".blue + systemState.browseName.name.blue + " : " + systemState.nodeId + "".green);

                            }, function (err) {

                            });

                            fCallback(praefix, item);

                        } else if (
                            ( item.isForward && item.referenceTypeId.namespace === 0 && item.referenceTypeId.value === 47) || //  hasComponent
                            ( item.isForward && item.referenceTypeId.namespace === 0 && item.referenceTypeId.value === 35) || // organizes
                            ( item.isForward && item.referenceTypeId.namespace === self.targetNameSpace && item.referenceTypeId.value === 4033)  // hasConditiomMonitoringDomain
                        ) {
                            //console.log("Continue search -->" + item + "\n");
                            self.findCMFunctionsObjects(item.nodeId.namespace, item.nodeId.value, "", results, praefix + "-" + item.browseName.name, fCallback, eCallback);
                        }
                    });
                }
            }
        }
    });
};

DAISYOPCClient.prototype.findCMFunctionsObjectsFeaturesFolder = function (FONodeNS, FONodeID, FONodeName, prafix, CMfunctionObject, fCallback, eCallback) {
    var self = this;
    var berr = "";
    // TODO; Fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    this.browseNode(FONodeNS, FONodeID, FONodeID, function (err, browse_result) {
        //console.log("Continue search browseNode ######\n");
        var rslt = {error: null};
        if (err) {
            rslt.error = err.message;
            rslt.nodes = null;
            //console.log("Continue search browseNode Errror: "+ err + "\n");
            eCallback(err);
        } else {
            if (browse_result) {
                if (browse_result[0].references) {
                    browse_result[0].references.forEach(function (item) {
                        if (
                            ( item.isForward && item.referenceTypeId.namespace === 0 && item.referenceTypeId.value === 47) // Has Component
                        ) {

                            if (item.browseName.name === 'Features') {
                                var tmp_key_feature_folder = prafix + "-" + item.browseName.name;
                                self.findCMFeaturesFunctionsObjects(item.nodeId.namespace, item.nodeId.value, item.nodeId.value, tmp_key_feature_folder, CMfunctionObject, function (value) {

                                }, function (err) {

                                });

                                fCallback(item);
                            }


                        }
                    });
                }
            }
        }
    });
};

DAISYOPCClient.prototype.findCMFeaturesFunctionsObjects = function (FNodeNS, FNodeID, FNodeName, prafix, CMfunctionObject, fCallback, eCallback) {
    var self = this;
    var berr = "";
    // TODO; Fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    this.browseNode(FNodeNS, FNodeID, FNodeID, function (err, browse_result) {
        //console.log("Continue search browseNode ######\n");
        var rslt = {error: null};
        if (err) {
            rslt.error = err.message;
            rslt.nodes = null;
            //console.log("Continue search browseNode Errror: "+ err + "\n");
            eCallback(err);
        } else {
            if (browse_result) {
                if (browse_result[0].references) {
                    browse_result[0].references.forEach(function (item) {
                        if (
                            ( item.isForward && item.referenceTypeId.namespace == 0 && item.referenceTypeId.value == 47) // Has Component
                        ) {
                            var tmp_key_feature = prafix + "_" + item.browseName.name;
                            var val = {};
                            val['path'] = tmp_key_feature;
                            val['node'] = item;
                            if (CMfunctionObject['features'] === undefined) {
                                CMfunctionObject['features'] = [];
                            }
                            CMfunctionObject['features'].push(val);

                            self.findCMFeaturesProperties(item.nodeId.namespace, item.nodeId.value, item.nodeId.value, tmp_key_feature, CMfunctionObject['features'][CMfunctionObject['features'].length - 1], function (value) {
                                console.log("FeatureValueCallBack Node -->" + tmp_key_feature.yellow + "_".green + value.browseName.name.green + " : " + value.nodeId + "".green);
                            }, function (err) {

                            });

                            fCallback(item);
                        }
                    });
                }
            }
        }
    });
};


DAISYOPCClient.prototype.findCMFunctionsSystemStates = function (FONodeNS, FONodeID, FONodeName, prafix, CMfunctionObject, fCallback, eCallback) {
    var self = this;
    var berr = "";
    // TODO; Fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    this.browseNode(FONodeNS, FONodeID, FONodeID, function (err, browse_result) {
        //console.log("Continue search browseNode ######\n");
        var rslt = {error: null};
        if (err) {
            rslt.error = err.message;
            rslt.nodes = null;
            //console.log("Continue search browseNode Errror: "+ err + "\n");
            eCallback(err);
        } else {
            if (browse_result) {
                if (browse_result[0].references) {
                    browse_result[0].references.forEach(function (item) {
                        if (
                            ( item.isForward && item.referenceTypeId.namespace === 0 && item.referenceTypeId.value === 46)
                        ) {
                            var tmp_key_systemState = prafix + "_" + item.browseName.name;
                            var val = {};
                            val['path'] = tmp_key_systemState;
                            val['node'] = item;

                            if (item.browseName.name === 'systemState') {
                                if (CMfunctionObject['systemState'] === undefined) {
                                    CMfunctionObject['systemState'] = [];
                                }
                                CMfunctionObject['systemState'].push(val);
                                fCallback(item);
                            }

                            if (item.browseName.name === 'conditionState') {
                                if (CMfunctionObject['conditionState'] === undefined) {
                                    CMfunctionObject['conditionState'] = [];
                                }
                                CMfunctionObject['conditionState'].push(val);
                                fCallback(item);
                            }

                            if (item.browseName.name === 'statusWord') {
                                if (CMfunctionObject['statusWord'] === undefined) {
                                    CMfunctionObject['statusWord'] = [];
                                }
                                CMfunctionObject['statusWord'].push(val);
                                fCallback(item);
                            }
                        }
                    });
                }
            }
        }
    });
};


DAISYOPCClient.prototype.findCMFeaturesProperties = function (FNodeNS, FNodeID, FNodeName, prafix, CMfunctionObjectFeature, fCallback, eCallback) {
    var self = this;
    var berr = "";
    // TODO; Fehlerbehandlung

    if (this.session === undefined) {
        berr = "Session is not opened.";
        fCallback(berr, null);
        return;
    }

    this.browseNode(FNodeNS, FNodeID, FNodeID, function (err, browse_result) {
        //console.log("Continue search browseNode ######\n");
        var rslt = {error: null};
        if (err) {
            rslt.error = err.message;
            rslt.nodes = null;
            //console.log("Continue search browseNode Errror: "+ err + "\n");
            eCallback(err);
        } else {
            if (browse_result) {
                if (browse_result[0].references) {
                    browse_result[0].references.forEach(function (item) {
                        if (
                            ( item.isForward && item.referenceTypeId.namespace === 0 && item.referenceTypeId.value == 47)
                        ) {
                            var tmp_key_feature_properties = prafix + "_" + item.browseName.name;
                            var val = {};
                            val['path'] = tmp_key_feature_properties;
                            val['node'] = item;
                            val['derived'] = (item.displayName.text.indexOf("maxValue") !== -1)
                                || (item.displayName.text.indexOf("minValue") !== -1)
                                || (item.displayName.text.indexOf("varValue") !== -1)
                                || (item.displayName.text.indexOf("avgValue") !== -1);
                            if (CMfunctionObjectFeature['values'] === undefined) {
                                CMfunctionObjectFeature['values'] = [];
                            }
                            CMfunctionObjectFeature['values'].push(val);

                            fCallback(item);
                        }
                    });
                }
            }
        }
    });
};

/*#####################################################################################*/
/* OPC CLIENT MANAGER
 /*#####################################################################################*/

var DAISYOPCClientManager = function () {
    var self = this;
    if(DAISYOPCClientManager_singleton){
        return DAISYOPCClientManager_singleton;
    }else{
        this.clientList = {};
        DAISYOPCClientManager_singleton = this;
    }
};

DAISYOPCClientManager.prototype.getClientID = function (ip, port, servername) {
    return md5(ip + "_" + port + "_" + servername);
};

DAISYOPCClientManager.prototype.getClientID = function (ip, port, servername) {
    return md5( ip + "_" + port + "_" + servername);
};

DAISYOPCClientManager.prototype.getClientList = function () {
    return this.clientList;
};

DAISYOPCClientManager.prototype.setClientList = function (list) {
    this.clientList = {};
    for (var i = 0; i < list.length; i++) {
        var ns = list[i];
        clientList.push(ns);
    }
};

DAISYOPCClientManager.prototype.addOPCClient = function (key, client) {
    if (key && client) this.clientList[key] = client;
};

DAISYOPCClientManager.prototype.getClient = function (key) {
    return this.clientList[key];
};

DAISYOPCClientManager.prototype.addNewOPCClient = function (ip, port, servername) {
    this.addOPCClient(this.getClientID(ip, port, servername), new DAISYOPCClient(ip, port, servername,  this.siohandler));
    return this.getClient(this.getClientID(ip, port, servername));
};

DAISYOPCClientManager.prototype.removeOPCClient = function (ip, port, servername) {
    delete this.clientList[this.getClientID(ip, port, servername)];
};

DAISYOPCClientManager.prototype.configureMasterClient = function(ip, port, servername){
    this.xclient = opcManager.addNewOPCClient(ip, port, servername, "*");
    // find or instantiate a new client
    this.xclient.connect(ip, port, servername, function (err) {
        var reslt = {error: null};
        if (err) {
            //
        } else {
            var results = [];
            this.xclient.findCMFunctionsObjects(this.xclient.targetNameSpace, this.xclient.targetNodeID, 'Objects', results, "PRESSESIMULATOR", function (praefix, item_result) {
                    //console.log("FCallBack Node -->" +praefix.yellow + " : "+ item_result.nodeId + "\n".green);
                    //res.setHeader('Content-Type', 'application/json');
                    //res.send(JSON.stringify(item_result));
                },
                function (err) {
                    console.log("ECallBack Node -->" + err);
                }
            );
        }
    });
};

var DAISYOPCClientManager_singleton = null;

module.exports = {
    getSingletonInstance: function () {
        if(DAISYOPCClientManager_singleton){
            return DAISYOPCClientManager_singleton;
        }else{
            DAISYOPCClientManager_singleton = new DAISYOPCClientManager();
        }
        return DAISYOPCClientManager_singleton;
    }
};

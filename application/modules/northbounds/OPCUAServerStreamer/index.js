/**
 * Copyright 2018 FAPS.
 *
 * File: application/modules/northbounds/dummyServer.js
 * Project: SP 142
 * Author:
 *  - Jupiter Bakakeu ...
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
 * ###################### Description #################################
 * OPCUAServerStreamer -- Basically an OPC UA Server with a user-defined Address Space. Mapping is also supported. 
 example_config:
        {
            id: "OPCUAServerStreamer_1",
            name: "OPCUAServerStreamer_1",
            type: "OPCUAServerStreamer",
            level: "info",
            modulesetting: {
                ip: "localhost",
                port: 48024,
                endpointName: 'OPCUA@FAPS',
                server_certificate_file: 'server_certificate_2048.pem',
                server_certificate_privatekey_file:'server_key_2048.pem',
                username: 'root',
                passsword:'root',
                allowAnonymous: false,
                serverInfo: {
                    applicationUri: "http://faps.fau.de/OPCUA_SERVER",
                    productUri: "faps.fau.de/ESYS_DEMONSTRATOR_example",
                    applicationName: { text: "ESYS_DEMONSTRATOR@FAPS" }
                },
                serverNodeSet: [ // Server node set. Each item of these array will be instantiated in a separate namespace.
                    "./node_modules_xml/Opc.Ua.Plc.NodeSet2.xml",
                    "./node_modules_xml/demonstrator/faps.xml",
                    "./node_modules_xml/demonstrator/vdma_24582_condition_monitoring.xml",
                    "./node_modules_xml/demonstrator/packml.xml",
                    "./node_modules_xml/demonstrator/energybaustein.xml",
                    "./node_modules_xml/demonstrator/esys_demonstrator.xml"
                ],
                fromObject: {
                    enable: false,
                    object_inputs: [{
                            name: "Portal_Stream_Energy_Data",
                            variables: [{
                                name: "P2",
                                datatype: "real",
                                si_unit: "A",
                                default: 0.0,
                                //-------------
                                ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                nodeID: "FB1_Foerderband_Antrieb_acceleration"
                                    //-------------
                            }]
                        },
                        {
                            name: "Demonstrator_Stream_Data",
                            variables: [{
                                name: "encoder_values_x",
                                datatype: "real",
                                si_unit: "V",
                                default: 0.0,
                                //-------------
                                ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                nodeID: "FB1_Foerderband_Antrieb_electricalcurrent"
                                    //-------------
                            }]
                        }
                    ]
                }
            },
            inputs_variables: [ // The output variables specify how to interpret and map the data received
                {
                    name: "P1", // Variable Name
                    targetNodeID: {
                        ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/", // Namespace uri
                        nid: "FB1_Foerderband_Antrieb_acceleration" // NodeId of the opcua variable
                    },
                    datatype: "real",
                    default: 0.0 // Default value
                },
                {
                    name: "P2",
                    targetNodeID: {
                        ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/", // Namespace uri
                        nid: "FB1_Foerderband_Antrieb_electricalcurrent" // NodeId of the opcua variable
                    },
                    datatype: "real",
                    default: 0.0
                }
            ],
            system: false
        }
 *
 * --------------------------------------------------------------------
 **/

var when = require('when');
var util = require("util");

var opcua = require("./node_modules/node-opcua");
var path = require("path");
var rootFolder = path.join(__dirname, "../../../../");

//var server_certificate_file = path.join(__dirname, "./certificates/uaservercert.der");
//var server_certificate_privatekey_file = path.join(__dirname, "./certificates/uaserverkey.nopass.pem");


var regexGUID = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/;
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

var OPCUAServerStreamerInterface = function() {
    this.server = null;
    this.datavalues = [];
    this.NodeIDMap = {};
};

OPCUAServerStreamerInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    this.settings = _settings;
    this.settings.name = this.settings.name || "OPCUAServerStreamerInstance";
    this.settings.id = this.settings.id || util.generateId();
    this.settings.level = this.settings.level || "info";
    this.settings.modulesetting = this.settings.modulesetting || {};
    this.settings.modulesetting.ip = this.settings.modulesetting.ip || "localhost";
    this.settings.modulesetting.port = this.settings.modulesetting.port || 48020;
    this.settings.modulesetting.endpointName = this.settings.modulesetting.endpointName || 'OPCUA@FAPS';
    this.settings.modulesetting.server_certificate_file = this.settings.modulesetting.server_certificate_file || "server_cert_1024.pem";
    this.settings.modulesetting.server_certificate_privatekey_file = this.settings.modulesetting.server_certificate_privatekey_file || "server_key_1024.pem";
    this.settings.modulesetting.username = this.settings.modulesetting.username || 'root';
    this.settings.modulesetting.passsword = this.settings.modulesetting.passsword ||'root';
    this.settings.modulesetting.allowAnonymous = this.settings.modulesetting.allowAnonymous || false;
    this.settings.modulesetting.serverInfo = this.settings.modulesetting.serverInfo || {
        applicationUri: "http://faps.fau.de/OPCUA_SERVER",
        productUri: "faps.fau.de/ESYS_DEMONSTRATOR_example",
        applicationName: { text: "ESYS_DEMONSTRATOR@FAPS" }
    };
    //serverNodeSet
    this.settings.modulesetting.serverNodeSet = this.settings.modulesetting.serverNodeSet || [];
    this.settings.modulesetting.fromObject = this.settings.modulesetting.fromObject || {
        enable: false,
        object_inputs: []
    };
    this.settings.outputs_variables = this.settings.outputs_variables || [];
    this.settings.inputs_variables = this.settings.inputs_variables || [];

    // Get all node set
    var nodeset_filenames = [opcua.standard_nodeset_file,
        opcua.di_nodeset_filename
    ];

    if (this.settings.modulesetting.serverNodeSet) {
        for (let index = 0; index < this.settings.modulesetting.serverNodeSet.length; index++) {
            this.settings.modulesetting.serverNodeSet[index] = path.join(__dirname, this.settings.modulesetting.serverNodeSet[index]);
        }
        nodeset_filenames = nodeset_filenames.concat(this.settings.modulesetting.serverNodeSet);
    }
    // Initialize the module
    this.server = new opcua.OPCUAServer({
        port: self.settings.modulesetting.port,
        timeout: 15000,
        maxAllowedSessionNumber: 100,
        serverInfo: {
            applicationUri: self.settings.modulesetting.serverInfo.applicationUri,
            productUri: self.settings.modulesetting.serverInfo.productUri,
            applicationName: { text: self.settings.modulesetting.serverInfo.applicationName.text }
        },
        nodeset_filename: nodeset_filenames,
        alternateHostname: self.settings.modulesetting.ip,
        isAuditing: false,
        certificateFile: path.join(rootFolder, "./certificates/" + self.settings.modulesetting.server_certificate_file),
        privateKeyFile: path.join(rootFolder,"./certificates/" + self.settings.modulesetting.server_certificate_privatekey_file),
        userManager: {
            isValidUser: function (userName, password) {
                if (userName === self.settings.modulesetting.username && password === self.settings.modulesetting.password) {
                    return true;
                }
                if (userName === "root" && password === "root") {
                    return true;
                }
                return false;
            }
        },
        allowAnonymous: self.settings.modulesetting.allowAnonymous
    });

    this.server.buildInfo.productName = self.settings.name;
    this.server.buildInfo.buildNumber = "001";
    this.server.buildInfo.buildDate = new Date();

    this.server.initialize(function() {
        self.app.engine.log.info("Northbound[" + self.settings.name + "] initialized successfully!");
        // start the OPC UA Server
        self.server.start(function(err) {
            if (err) {
                self.app.engine.log.info("OPC UA Server[" + self.settings.name + "] could not start. Error: " + JSON.stringify(err));
                return;
            }
            var endpointUrl = self.server.endpoints[0].endpointDescriptions()[0].endpointUrl;

            self.app.engine.log.info("Northbound[" + self.settings.name + "] started on endpoint: " + endpointUrl + " successfully!");

            self.server.endpoints[0].endpointDescriptions().forEach(function(endpoint) {
                self.app.engine.log.info("    Northbound[" + self.settings.name + "]  " + endpoint.endpointUrl + " " + endpoint.securityMode.toString() + " " + endpoint.securityPolicyUri.toString());
            });

            self.namespaceArray = self.server.engine.addressSpace.getNamespaceArray();

            // Map all the object Input variables
            if (self.settings.modulesetting.fromObject.enable) {
                self.settings.modulesetting.fromObject.object_inputs.forEach(function(objInput) {
                    // Parse Data Points
                    objInput.variables.forEach(function(el) {
                        var type = guidtest(el.nodeID);
                        var my_ns = self.namespaceArray.indexOf(el.ns);
                        if (my_ns === -1) my_ns = 0;
                        var targetNodeID = "ns=" + my_ns + ";" + type + "=" + el.nodeID;

                        var obj = self.server.engine.addressSpace.findNode(targetNodeID);
                        if (obj) {
                            self.NodeIDMap[el.name] = obj;
                        }
                    });
                });
            }

            // Maps all the inputs_variables NodeID
            self.settings.inputs_variables.forEach(function(el) {
                var type = guidtest(el.targetNodeID.nid);
                var my_ns = self.namespaceArray.indexOf(el.targetNodeID.ns);
                if (my_ns === -1) my_ns = 0;
                var targetNodeID = "ns=" + my_ns + ";" + type + "=" + el.targetNodeID.nid;
                var obj = self.server.engine.addressSpace.findNode(targetNodeID);
                if (obj) {
                    self.NodeIDMap[el.name] = obj;
                }
            });
        });
    });
    return when.resolve();
};

OPCUAServerStreamerInterface.prototype.start = function() {
    var self = this;
    self.namespaceArray = self.server.engine.addressSpace.getNamespaceArray();
    if (self.settings.modulesetting.fromObject.enable) {
        self.settings.modulesetting.fromObject.object_inputs.forEach(function(objInput) {
            self.app.outputbus.addListener(objInput.name, function(valObject) {
                // Parse Data Points
                objInput.variables.forEach(function(el) {
                    var arg = valObject.data[el.name];

                    var obj = self.NodeIDMap[el.name];
                    if (obj) {

                    } else {
                        var type = guidtest(el.nodeID);
                        var my_ns = self.namespaceArray.indexOf(el.ns);
                        if (my_ns === -1) my_ns = 0;
                        var targetNodeID = "ns=" + my_ns + ";" + type + "=" + el.nodeID;
                        obj = self.server.engine.addressSpace.findNode(targetNodeID);
                    }

                    if (obj) {
                        var targetValue = null;
                        switch (el.datatype) {
                            case 'real':
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.Float,
                                    value: arg
                                });
                                break;
                            case 'real':
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.Float,
                                    value: arg
                                });
                                break;
                            case 'double':
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.Double,
                                    value: arg
                                });
                                break;
                            case 'integer':
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.Int32,
                                    value: arg
                                });
                                break;
                            case 'uinteger':
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.UInt32,
                                    value: arg
                                });
                                break;
                            case 'String':
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.String,
                                    value: arg
                                });
                                break;
                            case 'boolean':
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.Boolean,
                                    value: arg !== 0
                                });
                                break;
                            default:
                                targetValue = new opcua.Variant({
                                    arrayType: opcua.VariantArrayType.Scalar,
                                    dataType: opcua.DataType.Float,
                                    value: 1.0
                                });
                                break;
                        }
                        obj.setValueFromSource(targetValue, opcua.StatusCodes.Good, new Date());
                    }
                });
            });
        });
    }

    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.addListener(el.name, function(val) {
            var arg = val;

            // Get the Object Variable
            var obj = self.NodeIDMap[el.name];
            if (obj) {
                // It is ok.
            } else {
                var type = guidtest(el.targetNodeID.nid);
                var my_ns = self.namespaceArray.indexOf(el.targetNodeID.ns);
                if (my_ns === -1) my_ns = 0;
                var targetNodeID = "ns=" + my_ns + ";" + type + "=" + el.targetNodeID.nid;
                obj = self.server.engine.addressSpace.findNode(targetNodeID);
            }

            if (obj) {
                var targetValue = null;
                switch (el.datatype) {
                    case 'real':
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.Float,
                            value: arg
                        });
                        break;
                    case 'float':
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.Float,
                            value: arg
                        });
                        break;
                    case 'double':
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.Double,
                            value: arg
                        });
                        break;
                    case 'integer':
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.Int32,
                            value: arg
                        });
                        break;
                    case 'uinteger':
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.UInt32,
                            value: arg
                        });
                        break;
                    case 'String':
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.String,
                            value: arg
                        });
                        break;
                    case 'boolean':
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.Boolean,
                            value: arg !== 0
                        });
                        break;
                    default:
                        targetValue = new opcua.Variant({
                            arrayType: opcua.VariantArrayType.Scalar,
                            dataType: opcua.DataType.Float,
                            value: 1.0
                        });
                        break;
                }
                obj.setValueFromSource(targetValue, opcua.StatusCodes.Good, new Date());
            }
        });
    });

    self.app.engine.log.info("Northbound[" + self.settings.name + "] started with ip: " + self.settings.modulesetting.ip + " successfully!");
    return when.resolve();
};

OPCUAServerStreamerInterface.prototype.stop = function() {
    var self = this;
    self.settings.inputs_variables.forEach(function(el) {
        self.app.outputbus.removeAllListeners(el.name);
    });

    //Stop the server
    if (self.server) {
        self.server.shutdown(3000, function(err) {
            self.app.engine.log.info("Northbound[" + self.settings.name + "] stops successfully!");
        });
    }
    return when.resolve();
};

OPCUAServerStreamerInterface.prototype.getSettings = function() {
    return this.settings;
};

module.exports = OPCUAServerStreamerInterface;
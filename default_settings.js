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
 */

// The `https` setting requires the `fs` module. Uncomment the following
// to make it available:
//var fs = require("fs");

module.exports = {
    // the tcp port that the OPEN_ACCESS web server is listening on
    uiPort: process.env.PORT || 1717,

    // By default, the OPEN_ACCESS UI accepts connections on all IPv4 interfaces.
    // The following property can be used to listen on a specific interface. For
    // example, the following would only allow connections from the local machine.
    uiHost: "127.0.0.1",

    // Retry time in milliseconds for TCP socket connections
    socketReconnectTime: 10000,

    // Timeout in milliseconds for TCP server socket connections
    //  defaults to no timeout
    socketTimeout: 120000,

    // Timeout in milliseconds for HTTP request connections
    //  defaults to 120 seconds
    httpRequestTimeout: 120000,

    // The maximum length, in characters, of any message sent to the debug sidebar tab
    debugMaxLength: 1000,


    // By default, credentials are encrypted in storage using a generated key. To
    // specify your own secret, set the following property.
    // If you want to disable encryption of credentials, set this property to false.
    // Note: once you set this property, do not change it - doing so will prevent
    // OPEN_ACCESS from being able to decrypt your existing credentials and they will be
    // lost.
    //credentialSecret: "a-secret-key",

    // The maximum size of HTTP request that will be accepted by the runtime swagger.
    // Default: 5mb
    apiMaxLength: '10mb',

    // Securing OPEN_ACCESS
    // -----------------
    // To password protect the OPEN_ACCESS editor and admin API, the following
    // property can be used. See http://nodered.org/docs/security.html for details.
    adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            password: "$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.",
            permissions: "*"
        }]
    },

    // The following property can be used to enable HTTPS
    // See http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
    // for details on its contents.
    // See the comment at the top of this file on how to load the `fs` module used by
    // this setting.
    //
    //https: {
    //    key: fs.readFileSync('privatekey.pem'),
    //    cert: fs.readFileSync('certificate.pem')
    //},

    // The following property can be used to cause insecure HTTP connections to
    // be redirected to HTTPS.
    requireHttps: false,


    // Anything in this hash is globally available to all functions.
    // It is accessed as context.global.
    // eg:
    //    functionGlobalContext: { os:require('os') }
    // can be accessed in a function block as:
    //    context.global.os

    functionGlobalContext: {
        os: require('os'),
        // octalbonescript:require('octalbonescript'),
        // jfive:require("johnny-five"),
        // j5board:require("johnny-five").Board({repl:false})
    },

    // The following property can be used to order the categories in the editor
    // palette. If a node's category is not in the list, the category will get
    // added to the end of the palette.
    // If not set, the following default order is used:
    //paletteCategories: ['subflows', 'input', 'output', 'function', 'social', 'mobile', 'storage', 'analysis', 'advanced'],

    // Configure the logging output
    runtimeMetricInterval: 60000,
    logging: {
        // Only console logging is currently supported
        console: {
            // Level of logging to be recorded. Options are:
            // fatal - only those errors which make the application unusable should be recorded
            // error - record errors which are deemed fatal for a particular request + fatal errors
            // warn - record problems which are non fatal + errors + fatal errors
            // info - record information about the general running of the application + warn + error + fatal errors
            // debug - record information which is more verbose than info + info + warn + error + fatal errors
            // trace - record very detailed logging + debug + info + warn + error + fatal errors
            level: "info",
            // Whether or not to include metric events in the log output
            metrics: true,
            // Whether or not to include audit events in the log output
            audit: false
        }
    },

    api: [
        // {
        //     name: "ConfigApi",
        //     type: "Swagger",
        //     port: 55554
        // }
        // ,
        // {
        //     name: "EberleinApi",
        //     type: "Swagger",
        //     port: 8090
        // }
    ],

    // Configure the logging output
    southbounds: {
        // Only dummy is currently supported
        dummy: {
            id: "67435124",
            name: "S_Dummy",
            type: "dummyClient",
            level: "info",
            modulesetting: { interval: 1000 },
            outputs_variables: [{
                    name: "I",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
                {
                    name: "U",
                    datatype: "real",
                    si_unit: "V",
                    default: 0.0
                },
                {
                    name: "t",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                }
            ],
            system: false
        },
        // example_config_opcua_client_object: {
        //     id: "OPCUAClientObject1", // Unique ID of the module in the global configuration
        //     name: "OPCUAClientObject1", // Name of the module instance.
        //     type: "OPCUAClientObject", // Type of the module, should always be "OPCUAClientObject" in order to use this module
        //     modulesetting: {
        //         server_adress: "localhost", // Address of the remote opc ua server
        //         port: 48022, // Remote Port of the opc ua server module
        //         interval: 100, // default monitoring interval
        //         object_name: "OPCUAClientObject"
        //     },
        //     outputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "Demo.Dynamic.Scalar.Double", // Variable Name
        //             nodeId: {
        //                 ns: 4, // NamespaceIndex of the variable to monitor
        //                 nid: "Demo.Dynamic.Scalar.Double" // NodeId of the opcua variable
        //             },
        //             interval: 100, // Monitoring interval
        //             default: 0.0 // Default value
        //         },
        //         {
        //             name: "Demo.Dynamic.Scalar.Float", // Variable Name
        //             nodeId: {
        //                 ns: 4, // NamespaceIndex of the variable to monitor
        //                 nid: "Demo.Dynamic.Scalar.Float" // NodeId of the opcua variable
        //             },
        //             interval: 100, // Monitoring interval
        //             default: 0.0 // Default value
        //         }
        //     ]
        // }
        // "Example_MV440ImageStreamer":{
        //     id: "MV440ImageStreamer1",		// Unique ID of the module in the global configuration
        //     name: "MV440ImageStreamer1", 	// Name of the module instance.
        //     type: "MV440ImageStreamer",     // Type of the module, should always be "LCOM" in order to use this module
        //     modulesetting: {
        //         port: 8765, 			// Local Port of the Socket server module
        //         host: "192.168.1.53", // Ip-Address to bound the socket listener
        //     },
        //     outputs_variables: [ 	// The output variables specify how to interpret and map the data received
        //         {
        //             name: "ImageFiles", 	// Variable Name
        //             datatype: "Object", 	// Type of the data to read: always "object"
        //         }
        //     ]
        // },
        // example_SNAP7_config: {
        //     id: "SNAP7Client1", // Unique ID of the module in the global configuration
        //     name: "SNAP7Client1", // Name of the module instance.
        //     type: "SNAP7Client", // Type of the module, should always be "SNAP7Client" in order to use this module
        //     modulesetting: {
        //         ip: '192.168.0.1', // Remote IP-Address of the PLC server module
        //         rack: 0, // PLC Rack number
        //         slot: 1, // PLC Slot number
        //         interval: 10, // Interval to pool the data in ms
        //     },
        //     outputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "I_Bool_Enable", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "byte", // Type of the data to read: "real", "int", "byte"
        //             default: false,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             area: 0x83, // Area identifier (0x81 Process inputs, 0x82 Process outputs, 0x83	Merkers, 0x84 DB, 0x1C Counters,0x1D Timers)
        //             dbNumber: 1, // DB number if area = 0x84, otherwise ignored
        //             start: 18, // Offset to start
        //             amount: 1, // Amount of words to read
        //             wordLen: 0x02 // Word size (0x01 Bit (inside a word), 0x02 Byte (8 bit), 0x04	Word (16 bit), 0x06	Double Word (32 bit), 0x08	Real (32 bit float), 0x1C	Counter (16 bit), 0x1D	Timer (16 bit))
        //         },
        //         {
        //             name: "I_Bool_Direction", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "byte", // Type of the data to read: "real", "int", "byte"
        //             default: false,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             area: 0x83, // Area identifier (0x81 Process inputs, 0x82 Process outputs, 0x83	Merkers, 0x84 DB, 0x1C Counters,0x1D Timers)
        //             dbNumber: 1, // DB number if area = 0x84, otherwise ignored
        //             start: 19, // Offset to start
        //             amount: 1, // Amount of words to read
        //             wordLen: 0x02 // Word size (0x01 Bit (inside a word), 0x02 Byte (8 bit), 0x04	Word (16 bit), 0x06	Double Word (32 bit), 0x08	Real (32 bit float), 0x1C	Counter (16 bit), 0x1D	Timer (16 bit))
        //         },
        //         {
        //             name: "Q_Bool_Run", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "byte", // Type of the data to read: "real", "int", "byte"
        //             default: false,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             area: 0x83, // Area identifier (0x81 Process inputs, 0x82 Process outputs, 0x83	Merkers, 0x84 DB, 0x1C Counters,0x1D Timers)
        //             dbNumber: 1, // DB number if area = 0x84, otherwise ignored
        //             start: 20, // Offset to start
        //             amount: 1, // Amount of words to read
        //             wordLen: 0x02 // Word size (0x01 Bit (inside a word), 0x02 Byte (8 bit), 0x04	Word (16 bit), 0x06	Double Word (32 bit), 0x08	Real (32 bit float), 0x1C	Counter (16 bit), 0x1D	Timer (16 bit))
        //         },
        //         {
        //             name: "Q_Real_Velocity", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "real", // Type of the data to read: "real", "int", "byte"
        //             default: 0.0,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             area: 0x83, // Area identifier (0x81 Process inputs, 0x82 Process outputs, 0x83	Merkers, 0x84 DB, 0x1C Counters,0x1D Timers)
        //             dbNumber: 1, // DB number if area = 0x84, otherwise ignored
        //             start: 8, // Offset to start
        //             amount: 1, // Amount of words to read
        //             wordLen: 0x08 // Word size (0x01 Bit (inside a word), 0x02 Byte (8 bit), 0x04	Word (16 bit), 0x06	Double Word (32 bit), 0x08	Real (32 bit float), 0x1C	Counter (16 bit), 0x1D	Timer (16 bit))
        //         },
        //         {
        //             name: "I_Target_Velocity", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "real", // Type of the data to read: "real", "int", "byte"
        //             default: 0.0,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             area: 0x83, // Area identifier (0x81 Process inputs, 0x82 Process outputs, 0x83	Merkers, 0x84 DB, 0x1C Counters,0x1D Timers)
        //             dbNumber: 1, // DB number if area = 0x84, otherwise ignored
        //             start: 12, // Offset to start
        //             amount: 1, // Amount of words to read
        //             wordLen: 0x08 // Word size (0x01 Bit (inside a word), 0x02 Byte (8 bit), 0x04	Word (16 bit), 0x06	Double Word (32 bit), 0x08	Real (32 bit float), 0x1C	Counter (16 bit), 0x1D	Timer (16 bit))
        //         }
        //     ]
        // },
        // example_opcua_client_config: {
        //     id: "OPCUAClient1", // Unique ID of the module in the global configuration
        //     name: "OPCUAClient1", // Name of the module instance.
        //     type: "OPCUAClient", // Type of the module, should always be "OPCUAClient" in order to use this module
        //     modulesetting: {
        //         server_adress: "localhost", // Address of the remote opc ua server
        //         port: 48020, // Remote Port of the opc ua server module
        //         interval: 1000, // default monitoring interval
        //     },
        //     outputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "Demo.Dynamic.Scalar.Double", // Variable Name
        //             nodeId: {
        //                 ns: 4, // NamespaceIndex of the variable to monitor
        //                 nid: "Demo.Dynamic.Scalar.Double" // NodeId of the opcua variable
        //             },
        //             interval: 1000, // Monitoring interval
        //             default: 0.0 // Default value
        //         },
        //         {
        //             name: "Demo.Dynamic.Scalar.Float", // Variable Name
        //             nodeId: {
        //                 ns: 4, // NamespaceIndex of the variable to monitor
        //                 nid: "Demo.Dynamic.Scalar.Float" // NodeId of the opcua variable
        //             },
        //             interval: 1000, // Monitoring interval
        //             default: 0.0 // Default value
        //         }
        //     ]
        // },
        // example_opcua_client_config2: {
        //     id: "OPCUAClient2", // Unique ID of the module in the global configuration
        //     name: "OPCUAClient2", // Name of the module instance.
        //     type: "OPCUAClient", // Type of the module, should always be "OPCUAClient" in order to use this module
        //     modulesetting: {
        //         server_adress: "localhost", // Address of the remote opc ua server
        //         port: 48022, // Remote Port of the opc ua server module
        //         interval: 1000, // default monitoring interval
        //     },
        //     outputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "Demo.Dynamic.Scalar.Double", // Variable Name
        //             nodeId: {
        //                 ns: 4, // NamespaceIndex of the variable to monitor
        //                 nid: "Demo.Dynamic.Scalar.Double" // NodeId of the opcua variable
        //             },
        //             interval: 5000, // Monitoring interval
        //             default: 0.0 // Default value
        //         },
        //         {
        //             name: "Demo.Dynamic.Scalar.Float", // Variable Name
        //             nodeId: {
        //                 ns: 4, // NamespaceIndex of the variable to monitor
        //                 nid: "Demo.Dynamic.Scalar.Float" // NodeId of the opcua variable
        //             },
        //             interval: 5000, // Monitoring interval
        //             default: 0.0 // Default value
        //         }
        //     ]
        // },
        // example_modbus_config: {
        //     id: "modbusTCP1", // Unique ID of the module in the global configuration
        //     name: "modbusTCP1", // Name of the module instance.
        //     type: "ModBusClient", // Type of the module, should always be "ModBusClient" in order to use this module
        //     modulesetting: {
        //         ip: '192.168.1.16', // Remote IP-Address of the Modbus server module
        //         port: 502, // Remote Port of the ModBus server module
        //         clientID: 9, // ModBus Client ID
        //         interval: 1000, // Interval to pool the data
        //         start: 1, // Start Address of the registers to read
        //         size: 100, // Size in Bytes of the registers to read
        //         object_name: "Portal_Stream_Energy_Data" // Name of the object that will hold all the data read.
        //     },
        //     outputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "Portal_Spannung_L1_N", // Variable Name
        //             datatype: "real", // Type of the data to read: "real", "int", "byte"
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             address: 1, // Start Address on the remote modBus server.
        //             default: 0.0 // Default value
        //         },
        //         {
        //             name: "Portal_Spannung_L2_N",
        //             datatype: "real",
        //             si_unit: "V",
        //             address: 1,
        //             default: 0.0
        //         }
        //     ]
        // },
        // exampleAMQPClient_config: {
        //     id: "DemonstratorProgramFromCloud",
        //     name: "DemonstratorProgramFromCloud",
        //     type: "AMQPInputStreamer",
        //     level: "info",
        //     modulesetting: {
        //         ip: "amqp://esys:esys@131.188.113.59",
        //         exchange: 'AMQPStreamer_Exchange_ProgramFromCloud',
        //         queue: 'DemonstratorProgramFromCloud'
        //     },
        //     outputs_variables: [{
        //         name: "FAPS_DemonstratorProgramFromCloud_Input",
        //         datatype: "Object",
        //         si_unit: "-",
        //         default: {}
        //     }],
        //     system: false
        // }
    },
    northbounds: {
        // example_config: {
        //     id: "AMQPOutputStreamer1", // Unique ID of the module in the global configuration
        //     name: "AMQPOutputStreamer1", // Name of the module instance.
        //     type: "AMQPOutputStreamer", // Type of the module, should always be "AMQPOutputStreamer" in order to use this module
        //     modulesetting: {
        //         server_address: "amqp://esys:esys@131.188.113.59", // Remote Address of the amqp server module
        //         exchange: 'AMQPStreamer_Exchange_ProgramFromCloud', // RabbitMQ Exchange, since we used a rabbitMQ Client
        //         queue: 'DemonstratorProgramToCloud' // RabbitMQ dedicated Que name 

        //     },
        //     inputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "P1", // Name of the variable that will hold the data received
        //             datatype: "Object", // All data received will be encapsulated in an object
        //             si_unit: "-",
        //             default: {}
        //         }
        //     ]
        // },
        // MQTT_example_config: {
        //     id: "MQTTStreamer1", // Unique ID of the module in the global configuration
        //     name: "MQTTStreamer1", // Name of the module instance.
        //     type: "MQTTStreamer", // Type of the module, should always be "MQTTStreamer" in order to use this module
        //     modulesetting: {
        //         ip: "mqtt://test.mosquitto.org:1883", // MQTT Remote Endpoint
        //         user: "test", // Username
        //         pass: "test", // Pass
        //         topic: "MQTT Topic" // MQTT Topic
        //     },
        //     inputs_variables: [ // The output variables specify the variables to generate
        //         {
        //             name: "P1", // Variable Name
        //             datatype: "real", // Type of the data to read: "real", "int", "byte"
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             default: 0.0 // Default value
        //         },
        //         {
        //             name: "P2",
        //             datatype: "real",
        //             si_unit: "V",
        //             default: 0.0
        //         }
        //     ]
        // },
        // OPCUAStreamer_example_config: {
        //     id: "OPCUAClientStreamer1", // Unique ID of the module in the global configuration
        //     name: "OPCUAClientStreamer1", // Name of the module instance.
        //     type: "OPCUAClientStreamer", // Type of the module, should always be "OPCUAClientStreamer" in order to use this module
        //     modulesetting: {
        //         server_adress: "localhost", // Address of the remote opc ua server
        //         port: 48020, // Remote Port of the opc ua server module
        //     },
        //     inputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "P1", // Input Variable Name
        //             nodeId: {
        //                 ns: 4, // NamespaceIndex of the variable to monitor
        //                 nid: "Demo.Static.Scalar.Double" // NodeId of the opcua variable
        //             },
        //             opcuaDataType: 11, //( Boolean: 1,SByte:2,Byte :3,Int16: 4, UInt16: 5, Int32: 6, UInt32: 7,Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid:14,
        //             //ByteString:  15, XmlElement: 16, NodeId: 17, ExpandedNodeId:18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue:23, Variant: 24, DiagnosticInfo:   25 )
        //             default: 0.0 // Default value
        //         }
        //     ]
        // },
        // example_AMQPOutputStreamer: {
        //     id: "AMQPOutputStreamer1", 		        // Unique ID of the module in the global configuration
        //     name: "AMQPOutputStreamer1", 	        // Name of the module instance.
        //     type: "AMQPOutputStreamer", 	            // Type of the module, should always be "AMQPOutputStreamer" in order to use this module
        //     modulesetting: {
        //         server_address: "amqp://esys:esys@131.188.113.59",              // Remote Address of the amqp server module
        //         exchange:'AMQPStreamer_Exchange_CameraPictures',  // RabbitMQ Exchange, since we used a rabbitMQ Client
        //         queue:'DemonstratorCameraPictures'                // RabbitMQ dedicated Que name 

        //     },
        //     inputs_variables: [ 	// The output variables specify how to interpret and map the data received
        //         {
        //                 name: "ImageFiles",    // Name of the variable that will hold the data received
        //                 datatype: "object",                                 // All data received will be encapsulated in an object
        //                 si_unit: "-",
        //                 default: {}
        //             }
        //     ]
        // },
        // WSSStreamer_example_config: {
        //     id: "WSStreamer1", // Unique ID of the module in the global configuration
        //     name: "WSStreamer1", // Name of the module instance.
        //     type: "WSStreamer", // Type of the module, should always be "WSStreamer" in order to use this module
        //     modulesetting: {
        //         port: 8080 // local port of the websocket server.
        //     },
        //     inputs_variables: [ // The output variables specify the variables to generate
        //         {
        //             name: "P1", // Variable Name
        //             datatype: "real", // Type of the data to read: "real", "int", "byte"
        //             si_unit: "V", // Unit of the data variable. It is optional
        //             default: 0.0 // Default value
        //         },
        //         {
        //             name: "P2",
        //             datatype: "real",
        //             si_unit: "V",
        //             default: 0.0
        //         },
        //         {
        //             name: "I_Bool_Enable", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "byte", // Type of the data to read: "real", "int", "byte"
        //             default: false,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //         },
        //         {
        //             name: "I_Bool_Direction", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "byte", // Type of the data to read: "real", "int", "byte"
        //             default: false,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //         },
        //         {
        //             name: "Q_Bool_Run", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "byte", // Type of the data to read: "real", "int", "byte"
        //             default: false,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //         },
        //         {
        //             name: "Q_Real_Velocity", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "real", // Type of the data to read: "real", "int", "byte"
        //             default: 0.0,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //         },
        //         {
        //             name: "I_Target_Velocity", // Variable that will hold the serialized value comming from the PLC.
        //             datatype: "real", // Type of the data to read: "real", "int", "byte"
        //             default: 0.0,
        //             si_unit: "V", // Unit of the data variable. It is optional
        //         }
        //     ]
        // },

        // opcua0: {
        //     id: "OPCUAServerStreamer_1",
        //     name: "OPCUAServerStreamer_1",
        //     type: "OPCUAServerStreamer",
        //     level: "info",
        //     modulesetting: {
        //         ip: "localhost",
        //         port: 48024,
        //         endpointName: 'OPCUA@FAPS',
        //         server_certificate_file: 'server_certificate_2048_5_years.pem',
        //         server_certificate_privatekey_file: 'server_key_2048_5_years.pem',
        //         username: 'jupiter',
        //         password: 'jupiter',
        //         allowAnonymous: false,
        //         serverInfo: {
        //             applicationUri: "http://faps.fau.de/OPCUA_SERVER",
        //             productUri: "faps.fau.de/ESYS_DEMONSTRATOR_example",
        //             applicationName: { text: "ESYS_DEMONSTRATOR@FAPS" }
        //         },
        //         serverNodeSet: [ // Server node set. Each item of these array will be instantiated in a separate namespace.
        //             "./node_modules_xml/Opc.Ua.Plc.NodeSet2.xml",
        //             "./node_modules_xml/demonstrator/faps.xml",
        //             "./node_modules_xml/demonstrator/vdma_24582_condition_monitoring.xml",
        //             "./node_modules_xml/demonstrator/packml.xml",
        //             "./node_modules_xml/demonstrator/energybaustein.xml",
        //             "./node_modules_xml/demonstrator/esys_demonstrator.xml"
        //         ],
        //         fromObject: {
        //             enable: false,
        //             object_inputs: [{
        //                     name: "Portal_Stream_Energy_Data",
        //                     variables: [{
        //                         name: "P2",
        //                         datatype: "real",
        //                         si_unit: "A",
        //                         default: 0.0,
        //                         //-------------
        //                         ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/",
        //                         nodeID: "FB1_Foerderband_Antrieb_acceleration"
        //                             //-------------
        //                     }]
        //                 },
        //                 {
        //                     name: "Demonstrator_Stream_Data",
        //                     variables: [{
        //                         name: "encoder_values_x",
        //                         datatype: "real",
        //                         si_unit: "V",
        //                         default: 0.0,
        //                         //-------------
        //                         ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/",
        //                         nodeID: "FB1_Foerderband_Antrieb_electricalcurrent"
        //                             //-------------
        //                     }]
        //                 }
        //             ]
        //         }
        //     },
        //     inputs_variables: [ // The output variables specify how to interpret and map the data received
        //         {
        //             name: "P1", // Variable Name
        //             targetNodeID: {
        //                 ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/", // Namespace uri
        //                 nid: "FB1_Foerderband_Antrieb_acceleration" // NodeId of the opcua variable
        //             },
        //             datatype: "real",
        //             default: 0.0 // Default value
        //         },
        //         {
        //             name: "P2",
        //             targetNodeID: {
        //                 ns: "http://faps.fau.de/ESYS_DEMONSTRATOR/", // Namespace uri
        //                 nid: "FB1_Foerderband_Antrieb_electricalcurrent" // NodeId of the opcua variable
        //             },
        //             datatype: "real",
        //             default: 0.0
        //         }
        //     ],
        //     system: false
        // },

        opcua0: {
            id: "OPCUAServerStreamer_1",
            name: "OPCUAServerStreamer_1",
            type: "OPCUAServerStreamer",
            level: "info",
            modulesetting: {
                ip: "localhost",
                port: 48024,
                endpointName: 'OPCUA@FAPS',
                server_certificate_file: 'server_certificate_2048_5_years.pem',
                server_certificate_privatekey_file: 'server_key_2048_5_years.pem',
                username: 'jupiter',
                password: 'jupiter',
                allowAnonymous: false,
                serverInfo: {
                    applicationUri: "http://faps.fau.de/OPCUA_SERVER",
                    productUri: "faps.fau.de/ESYS_DEMONSTRATOR_example",
                    applicationName: { text: "ESYS_DEMONSTRATOR@FAPS" }
                },
                serverNodeSet: [ // Server node set. Each item of these array will be instantiated in a separate namespace.
                    "./node_modules_xml/Opc.Ua.Plc.NodeSet2.xml",
                    "./node_modules_xml/demonstrator/faps.xml",
                    "./node_modules_xml/cki/CKI_PLC_1_OPCUA.xml"
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
        },

        // mindsphere_config: {
        //     id: "MindsphreLibStreamer1", // Unique ID of the module in the global configuration
        //     name: "MindsphreLibStreamer0", // Name of the module instance.
        //     type: "MindsphreLibStreamer", // Type of the module, should always be "MindsphreLibStreamer" in order to use this module
        //     modulesetting: {
        //         configuration: "ConveyorAssetCredential.json", // JSON Configuration of the agent
        //         object_name: 'OPCUAClientObject', // Name of the object that holds all values. This attribute is required
        //         datapoint_mapping: [
        //             { "dataPointId": "1557293223444", "qualityCode": "0", "name": "Demo.Dynamic.Scalar.Double" },
        //             { "dataPointId": "1557294045308", "qualityCode": "0", "name": "Demo.Dynamic.Scalar.Float" },
        //             { "dataPointId": "1557293154631", "qualityCode": "0", "name": "Demo.Dynamic.Scalar.Boolean" },
        //             { "dataPointId": "1557293273534", "qualityCode": "0", "name": "Demo.Dynamic.Scalar.Boolean" },
        //             { "dataPointId": "1557293295599", "qualityCode": "0", "name": "Demo.Dynamic.Scalar.Boolean" }
        //         ],
        //         interval: 1000 // Time interval (ms) to transfer the data to the cloud
        //     }
        // }
    },
    engine: {
        settings: {},
        flows: {
            dummy_DEMO: {
                id: "dummy_DEMO",
                name: "dummy_DEMO",
                type: "myfghfFlow",
                author: "Jupiter Bakakeu",
                version: "0.0.0.1",
                containers: {
                    sseese: {
                        id: "sseese",
                        name: "MyContainer",
                        type: "MULT2",
                        inputs: [{
                                name: "a",
                                label: "U(V)",
                                datatype: "real",
                                si_unit: "V",
                                default: 0.0,
                                type: "base_input",
                                variable: "U"
                            },
                            {
                                name: "b",
                                label: "I(A)",
                                datatype: "real",
                                si_unit: "A",
                                default: 0.0,
                                type: "base_input",
                                variable: "I"
                            }
                        ],
                        outputs: [{
                            name: "c",
                            label: "P1(W)",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "P1"
                        }]
                    },
                    TestADD: {
                        id: "TestADD",
                        name: "MyOtherContainer",
                        type: "ADD2",
                        inputs: [{
                                name: "a",
                                label: "OPCVar",
                                datatype: "real",
                                si_unit: "V",
                                default: 0.0,
                                type: "base_input",
                                variable: "I"
                            },
                            {
                                name: "b",
                                label: "t",
                                datatype: "real",
                                si_unit: "",
                                default: 0.0,
                                type: "base_input",
                                variable: "t"
                            }
                        ],
                        outputs: [{
                            name: "c",
                            label: "P2(W)",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "P2"
                        }]
                    },
                    OBJECT_FORWARD: {
                        id: "OPCUAClientObject_FORWARD",
                        name: "OPCUAClientObject_FORWARD",
                        type: "FORWARDOBJECT",
                        inputs: [{
                            name: "a",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_input",
                            variable: "OPCUAClientObject"
                        }],
                        outputs: [{
                            name: "b",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_output",
                            variable: "OPCUAClientObject"
                        }]
                    },
                    // ImageFiles_FORWARD: {
                    //     id: "ImageFiles_FORWARD",
                    //     name: "ImageFiles_FORWARD",
                    //     type: "FORWARDOBJECT",
                    //     inputs: [{
                    //         name: "a",
                    //         label: "",
                    //         datatype: "object",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_input",
                    //         variable: "ImageFiles"
                    //     }],
                    //     outputs: [{
                    //         name: "b",
                    //         label: "",
                    //         datatype: "object",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_output",
                    //         variable: "ImageFiles"
                    //     }]
                    // },
                    // I_Bool_Direction_FORWARD: {
                    //     id: "I_Bool_Direction_FORWARD",
                    //     name: "I_Bool_Direction_FORWARD",
                    //     type: "FORWARD",
                    //     inputs: [{
                    //         name: "I_Bool_Direction",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_input",
                    //         variable: "I_Bool_Direction"
                    //     }],
                    //     outputs: [{
                    //         name: "I_Bool_Direction_FORWARD_OUTPUT",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_output",
                    //         variable: "I_Bool_Direction"
                    //     }]
                    // },
                    // Q_Bool_Run_FORWARD: {
                    //     id: "Q_Bool_Run_FORWARD",
                    //     name: "Q_Bool_Run_FORWARD",
                    //     type: "FORWARD",
                    //     inputs: [{
                    //         name: "Q_Bool_Run",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_input",
                    //         variable: "Q_Bool_Run"
                    //     }],
                    //     outputs: [{
                    //         name: "Q_Bool_Run_FORWARD_OUTPUT",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_output",
                    //         variable: "Q_Bool_Run"
                    //     }]
                    // },
                    // Q_Real_Velocity_FORWARD: {
                    //     id: "Q_Real_Velocity_FORWARD",
                    //     name: "Q_Real_Velocity_FORWARD",
                    //     type: "FORWARD",
                    //     inputs: [{
                    //         name: "Q_Real_Velocity",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_input",
                    //         variable: "Q_Real_Velocity"
                    //     }],
                    //     outputs: [{
                    //         name: "Q_Real_Velocityn_FORWARD_OUTPUT",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_output",
                    //         variable: "Q_Real_Velocity"
                    //     }]
                    // },
                    // I_Target_Velocity_FORWARD: {
                    //     id: "I_Target_Velocity_FORWARD",
                    //     name: "I_Target_Velocity_FORWARD",
                    //     type: "FORWARD",
                    //     inputs: [{
                    //         name: "I_Target_Velocity",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_input",
                    //         variable: "I_Target_Velocity"
                    //     }],
                    //     outputs: [{
                    //         name: "I_Target_Velocity_FORWARD_OUTPUT",
                    //         label: "",
                    //         datatype: "byte",
                    //         si_unit: "-",
                    //         default: {},
                    //         type: "base_output",
                    //         variable: "I_Target_Velocity"
                    //     }]
                    // }
                }
            }
        }
    }
};
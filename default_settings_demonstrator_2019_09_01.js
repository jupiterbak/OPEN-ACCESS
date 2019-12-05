/**
 * Copyright 2016 Siemens AG.
 *
 * File: open_access.js
 * Project: SP 142
 * Author:
 *  - Fellipe ...
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
    apiMaxLength: '5mb',

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
    runtimeMetricInterval: 15000,
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

    api: [{
            name: "ConfigApi",
            type: "Swagger",
            port: 55554
        }
        // ,
        // {
        //     name: "EberleinApi",
        //     type: "Swagger",
        //     port: 8090
        // }
    ],

    // Configure the logging output
    southbounds: {
		// MODBUS TCP
		// Only dummy is currently supported
		"Example_MV440ImageStreamer":{
            id: "MV440ImageStreamer1",		// Unique ID of the module in the global configuration
            name: "MV440ImageStreamer1", 	// Name of the module instance.
            type: "MV440ImageStreamer",     // Type of the module, should always be "LCOM" in order to use this module
            modulesetting: {
                port: 8765, 			// Local Port of the Socket server module
                host: "192.168.1.51", // Ip-Address to bound the socket listener
            },
            outputs_variables: [ 	// The output variables specify how to interpret and map the data received
                {
                    name: "ImageFiles", 	// Variable Name
                    datatype: "object", 	// Type of the data to read: always "object"
                }
            ]
        },
        modbusTCP1: {
            id: "modbusTCP1",
            name: "modbusTCP1",
            type: "ModBusClient",
            level: "info",
            modulesetting: {ip:'192.168.1.16',interval:1000, port:502,clientID:9, start:1,size:100,
			object_name: "Portal_Stream_Energy_Data",
				object_data: {}
			},
            outputs_variables: [
                {
                    name: "Portal_Spannung_L1_N",
                    datatype: "real",
                    si_unit: "V",
					address: 1,
                    default: 0.0
                },
                {
                    name: "Portal_Spannung_L2_N",
                    datatype: "real",
                    si_unit: "V",
					address: 5,
                    default: 0.0
                },
                {
                    name: "Portal_Spannung_L3_N",
                    datatype: "real",
                    si_unit: "V",
					address: 9,
                    default: 0.0
                },
				{
                    name: "Portal_Strom_L1",
                    datatype: "real",
                    si_unit: "A",
					address: 25,
                    default: 0.0
                },
				{
                    name: "Portal_Strom_L2",
                    datatype: "real",
                    si_unit: "A",
					address: 29,
                    default: 0.0
                },
				{
                    name: "Portal_Strom_L3",
                    datatype: "real",
                    si_unit: "A",
					address: 33,
                    default: 0.0
                },
				{
                    name: "Portal_Scheinleistung_L1",
                    datatype: "real",
                    si_unit: "W",
					address: 37,
                    default: 0.0
                },
				{
                    name: "Portal_Scheinleistung_L2",
                    datatype: "real",
                    si_unit: "W",
					address: 41,
                    default: 0.0
                },
				{
                    name: "Portal_Scheinleistung_L3",
                    datatype: "real",
                    si_unit: "W",
					address: 45,
                    default: 0.0
                },
				{
                    name: "Portal_Wirkleistung_L1",
                    datatype: "real",
                    si_unit: "W",
					address: 49,
                    default: 0.0
                },
				{
                    name: "Portal_Wirkleistung_L2",
                    datatype: "real",
                    si_unit: "W",
					address: 53,
                    default: 0.0
                },
				{
                    name: "Portal_Wirkleistung_L3",
                    datatype: "real",
                    si_unit: "W",
					address: 57,
                    default: 0.0
                },
				{
                    name: "Portal_Blindleistung_L1",
                    datatype: "real",
                    si_unit: "W",
					address: 61,
                    default: 0.0
                },
				{
                    name: "Portal_Blindleistung_L2",
                    datatype: "real",
                    si_unit: "W",
					address: 65,
                    default: 0.0
                },
				{
                    name: "Portal_Blindleistung_L3",
                    datatype: "real",
                    si_unit: "W",
					address: 69,
                    default: 0.0
                }
				// {
                    // name: "Gesamtwirkleistung",
                    // datatype: "real",
                    // si_unit: "W",
					// address: 321,
                    // default: 0.0
                // },

				// {
                    // name: "Netzfrequenz",
                    // datatype: "real",
                    // si_unit: "Hz",
					// address: 301,
                    // default: 0.0
                // }
            ],
            system: false
        },
        // LCOM
        lcom: {
            id: "67435124_LCOM",
            name: "LCOM_Dummy",
            type: "LCOM_Demonstrator",
            level: "info",
            modulesetting: {
                port: 3456,
                packet_length: 192,
				object_name: "Demonstrator_Stream_Data",
				object_data: {}
            },
            outputs_variables: [{
                    name: "encoder_values_x",
                    datatype: "real",
                    si_unit: "increment",
                    default: 0.0
                },
                {
                    name: "acceleration_x",
                    datatype: "real",
                    si_unit: "m/s²",
                    default: 0.0
                },
                {
                    name: "speed_x",
                    datatype: "real",
                    si_unit: "m/s",
                    default: 0.0
                },
                {
                    name: "torque_x#",
                    datatype: "real",
                    si_unit: "Nm",
                    default: 0.0
                },
				{
                    name: "current_x#",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
				{
                    name: "force_x#",
                    datatype: "real",
                    si_unit: "N",
                    default: 0.0
                },
				{
                    name: "power_x#",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
				{
                    name: "driveEnabled_x",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "limit_switch_0_x#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "limit_switch_1_x#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "encoder_values_y",
                    datatype: "real",
                    si_unit: "increment",
                    default: 0.0
                },
				{
                    name: "acceleration_y",
                    datatype: "real",
                    si_unit: "m/s²",
                    default: 0.0
                },
				{
                    name: "speed_y",
                    datatype: "real",
                    si_unit: "m/s",
                    default: 0.0
                },
				{
                    name: "torque_y#",
                    datatype: "real",
                    si_unit: "Nm",
                    default: 0.0
                },
				{
                    name: "current_y#",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
				{
                    name: "force_y#",
                    datatype: "real",
                    si_unit: "N",
                    default: 0.0
                },
				{
                    name: "power_y#",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
				{
                    name: "driveEnabled_y",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "limit_switch_0_y#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "limit_switch_1_y#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "encoder_values_z",
                    datatype: "real",
                    si_unit: "increment",
                    default: 0.0
                },
				{
                    name: "acceleration_z",
                    datatype: "real",
                    si_unit: "m/s²",
                    default: 0.0
                },
				{
                    name: "speed_z",
                    datatype: "real",
                    si_unit: "m/s",
                    default: 0.0
                },
				{
                    name: "torque_z#",
                    datatype: "real",
                    si_unit: "Nm",
                    default: 0.0
                },
				{
                    name: "current_z#",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
				{
                    name: "force_z#",
                    datatype: "real",
                    si_unit: "N",
                    default: 0.0
                },
				{
                    name: "power_z#",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
				{
                    name: "driveEnabled_z",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "limit_switch_0_z#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "limit_switch_1_z#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "gripper_open#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "gripper_closed#",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
				{
                    name: "gripper_number#",
                    datatype: "real",
                    si_unit: "enum",
                    default: 0.0
                },
				{
                    name: "gripper_ventils#",
                    datatype: "byte",
                    si_unit: "",
                    default: 0.0
                },
				{
                    name: "gripper_power#",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
				{
                    name: "SentronPAC_power#",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
				{
                    name: "SentronPAC_current#",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
				{
                    name: "SentronPAC_TotalEnergy#",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
				{
                    name: "SentronPAC_Voltage#",
                    datatype: "real",
                    si_unit: "V",
                    default: 0.0
                },
				{
                    name: "OmacUnitModeCurrent#",
                    datatype: "real",
                    si_unit: "Mode",
                    default: 0.0
                },
				{
                    name: "OmacStateCurrent#",
                    datatype: "real",
                    si_unit: "Mode",
                    default: 0.0
                },
				{
                    name: "product_ready#",
                    datatype: "real",
                    si_unit: "Mode",
                    default: 0.0
                },
				{
                    name: "timestamp#",
                    datatype: "real",
                    si_unit: "time",
                    default: 0.0
                },
				{
                    name: "data_quality#",
                    datatype: "real",
                    si_unit: "quality",
                    default: 0.0
                },
				{
                    name: "i32ProgrammLength#",
                    datatype: "real",
                    si_unit: "-",
                    default: 0.0
                },
				{
                    name: "i32ActualProgrammPointer#",
                    datatype: "real",
                    si_unit: "-",
                    default: 0.0
                },
				{
                    name: "i32ProgrammState#",
                    datatype: "real",
                    si_unit: "-",
                    default: 0.0
                },
				{
                    name: "i32ProgrammRunning#",
                    datatype: "real",
                    si_unit: "-",
                    default: 0.0
                }
            ],
            system: false
        },
		FAPS_ProgramListener: {
            id: "213123445",
            name: "FAPS_ProgramListener",
            type: "DemonstratorProgramListener",
            level: "info",
            modulesetting: {
                listener_port:3461
            },
            outputs_variables: [
                {
                    name: "FAPS_DemonstratorProgramToCloud_Input",
                    datatype: "object",
                    si_unit: "-",
                    default: {}
                }
            ],
            system: false
        },
		amqpInputProgram: {
            id: "DemonstratorProgramFromCloud",
            name: "DemonstratorProgramFromCloud",
            type: "AMQPInputStreamer",
            level: "info",
            modulesetting: {
                ip: "amqp://esys:esys@131.188.113.59",
                exchange:'AMQPStreamer_Exchange_ProgramFromCloud',
                queue:'DemonstratorProgramFromCloud'
            },
            outputs_variables: [
                {
                    name: "FAPS_DemonstratorProgramFromCloud_Input",
                    datatype: "Object",
                    si_unit: "-",
                    default: {}
                }
            ],
            system: false
        }
    },
    northbounds: {
		example_AMQPOutputStreamer: {
            id: "AMQPOutputStreamer1", 		        // Unique ID of the module in the global configuration
            name: "AMQPOutputStreamer1", 	        // Name of the module instance.
            type: "AMQPStreamer", 	            // Type of the module, should always be "AMQPOutputStreamer" in order to use this module
            modulesetting: {
                ip: "amqp://esys:esys@131.188.113.59",              // Remote Address of the amqp server module
                exchange:'AMQPStreamer_Exchange_CameraPictures',  // RabbitMQ Exchange, since we used a rabbitMQ Client
                queue:'DemonstratorCameraPictures'                // RabbitMQ dedicated Que name 
                
            },
            inputs_variables: [ 	// The output variables specify how to interpret and map the data received
                {
                        name: "ImageFiles",    // Name of the variable that will hold the data received
                        datatype: "object",                                 // All data received will be encapsulated in an object
                        si_unit: "-",
                        default: {}
                    }
            ]
        },
		opcua0: {
            id: "OPCUAServerStreamer_1",
            name: "OPCUAServerStreamer_1",
            type: "OPCUAServerStreamer",
            level: "info",
            modulesetting: {
                ip : "131.188.112.42",
                port : 48020,
                endpointName : 'OPCUA@FAPS',
                fromObject: {
                    enable: true,
                    object_inputs:[
						{
                            name: "Portal_Stream_Energy_Data",
                            variables: [
                                {
                                    name: "Portal_Strom_L1",
                                    datatype: "real",
                                    si_unit: "A",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_X_electricalcurrent"
                                    //-------------
                                }
                            ]
                        },
						{
                            name: "Demonstrator_Stream_Data",
                            variables: [
                                {
                                    name: "encoder_values_x",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_X_position"
                                    //-------------
                                },
                                {
                                    name: "acceleration_x",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_X_acceleration"
                                    //-------------
                                },
								{
                                    name: "speed_x",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_X_speed"
                                    //-------------
                                },
								{
                                    name: "encoder_values_y",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_Y_position"
                                    //-------------
                                },
                                {
                                    name: "acceleration_y",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_Y_acceleration"
                                    //-------------
                                },
								{
                                    name: "speed_y",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_Y_speed"
                                    //-------------
                                },
								{
                                    name: "encoder_values_z",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_Z_position"
                                    //-------------
                                },
                                {
                                    name: "acceleration_z",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_Z_acceleration"
                                    //-------------
                                },
								{
                                    name: "speed_z",
                                    datatype: "real",
                                    si_unit: "V",
                                    default: 0.0,
                                    //-------------
                                    ns:     "http://faps.fau.de/ESYS_DEMONSTRATOR/",
                                    nodeID: "LINEAR_MOTOR_Z_speed"
                                    //-------------
                                }
                            ]
                        }
                    ]
                }
            },
			inputs_variables: [
            ],
            system: false
        },
        amqp0: {
            id: "AMQPStreamer_1",
            name: "AMQPStreamer",
            type: "AMQPStreamer_Demonstrator",
            level: "info",
            modulesetting: {
                ip: "amqp://esys:esys@131.188.113.59"
            },
            inputs_variables: [
                {
                    name: "Demonstrator_Stream_Data",
                    datatype: "object",
                    si_unit: "-",
                    default: {}
                },
				{
                    name: "Portal_Stream_Energy_Data",
                    datatype: "Object",
                    si_unit: "",
                    default: {}
                }
            ],
            system: false
        },
		amqp_ProgramToCloud: {
            id: "AMQPStreamer_ProgramToCloud",
            name: "AMQPStreamer_ProgramToCloud",
            type: "AMQPStreamer",
            level: "info",
            modulesetting: {
                ip: "amqp://esys:esys@131.188.113.59",
                exchange:'AMQPStreamer_Exchange_ProgramToCloud',
                queue:'DemonstratorProgramToCloud'
            },
            inputs_variables: [
                {
                    name: "FAPS_DemonstratorProgramToCloud_Output",
                    datatype: "Object",
                    si_unit: "",
                    default: {}
                }
            ],
            system: false
        },
        FAPS_ProgramWriter: {
            id: "fg46etwet",
            name: "FAPS_ProgramWriter",
            type: "DemonstratorProgramWriter",
            level: "info",
            modulesetting: {
                client_host:'192.168.1.1',
                client_port:28920
            },
            inputs_variables: [
                {
                    name: "FAPS_DemonstratorProgramFromCloud_Output",
                    datatype: "object",
                    si_unit: "-",
                    default: {}
                }
            ],
            system: false
        }
    },
    engine: {
        settings: {},
        flows: {
            dummy_flow1: {
                id: "dummy_flow1",
                name: "C_Dummy",
                type: "myFlow",
                author: "Jupiter Bakakeu",
                version: "0.0.0.1",
                containers: {
					cont_LCOM_0: {
                        id: "cont_LCOM_0",
                        name: "cont_LCOM_0",
                        type: "FORWARD",
                        inputs: [{
                            name: "Demonstrator_Stream_Data",
                            label: "Demonstrator_Stream_Data",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_input",
                            variable: "Demonstrator_Stream_Data"
                        }],
                        outputs: [{
                            name: "Demonstrator_Stream_Data",
                            label: "Demonstrator_Stream_Data",
                            datatype: "object",
                            si_unit: "-",
                            default: 0.0,
                            type: "base_output",
                            variable: "Demonstrator_Stream_Data"
                        }]
                    },
					cont_MODBUS_0: {
                        id: "cont_MODBUS_0",
                        name: "cont_MODBUS_0",
                        type: "FORWARD",
                        inputs: [{
                            name: "Portal_Stream_Energy_Data",
                            label: "Portal_Stream_Energy_Data",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_input",
                            variable: "Portal_Stream_Energy_Data"
                        }],
                        outputs: [{
                            name: "Portal_Stream_Energy_Data",
                            label: "Portal_Stream_Energy_Data",
                            datatype: "object",
                            si_unit: "-",
                            default: 0.0,
                            type: "base_output",
                            variable: "Portal_Stream_Energy_Data"
                        }]
                    },				
                    cont_Demonstrator_Program_To_Cloud: {
                        id: "cont_Demonstrator_Program_To_Cloud",
                        name: "cont_Demonstrator_Program",
                        type: "FORWARD",
                        inputs: [{
                            name: "FAPS_DemonstratorProgramToCloud_Input",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_input",
                            variable: "FAPS_DemonstratorProgramToCloud_Input"
                        }],
                        outputs: [{
                            name: "FAPS_DemonstratorProgramToCloud_Output",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_output",
                            variable: "FAPS_DemonstratorProgramToCloud_Output"
                        }]
                    },
                    cont_Demonstrator_Program_From_Cloud: {
                        id: "cont_Demonstrator_Program_From_Cloud",
                        name: "cont_Demonstrator_Program_From_Cloud",
                        type: "FORWARD",
                        inputs: [{
                            name: "FAPS_DemonstratorProgramFromCloud_Input",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_input",
                            variable: "FAPS_DemonstratorProgramFromCloud_Input"
                        }],
                        outputs: [{
                            name: "FAPS_DemonstratorProgramFromCloud_Output",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_output",
                            variable: "FAPS_DemonstratorProgramFromCloud_Output"
                        }]
                    },
					ImageFiles_FORWARD: {
                        id: "ImageFiles_FORWARD",
                        name: "ImageFiles_FORWARD",
                        type: "FORWARDOBJECT",
                        inputs: [{
                            name: "a",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_input",
                            variable: "ImageFiles"
                        }],
                        outputs: [{
                            name: "b",
                            label: "",
                            datatype: "object",
                            si_unit: "-",
                            default: {},
                            type: "base_output",
                            variable: "ImageFiles"
                        }]
                    }
                }
            }
        }
    }
};
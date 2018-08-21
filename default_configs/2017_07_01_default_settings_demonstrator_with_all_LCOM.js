/**
 * Copyright 2018 FAPS.
 *
 * File: open_access.js
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
        // LCOM
        lcom: {
            id: "67435124_LCOM",
            name: "LCOM_Dummy",
            type: "LCOM",
            level: "info",
            modulesetting: {
                port: 3456,
                packet_length: 172
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
                    name: "torque_x",
                    datatype: "real",
                    si_unit: "Nm",
                    default: 0.0
                },
                {
                    name: "current_x",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
                {
                    name: "force_x",
                    datatype: "real",
                    si_unit: "N",
                    default: 0.0
                },
                {
                    name: "power_x",
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
                    name: "limit_switch_0_x",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
                {
                    name: "limit_switch_1_x",
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
                    name: "torque_y",
                    datatype: "real",
                    si_unit: "Nm",
                    default: 0.0
                },
                {
                    name: "current_y",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
                {
                    name: "force_y",
                    datatype: "real",
                    si_unit: "N",
                    default: 0.0
                },
                {
                    name: "power_y",
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
                    name: "limit_switch_0_y",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
                {
                    name: "limit_switch_1_y",
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
                    name: "torque_z",
                    datatype: "real",
                    si_unit: "Nm",
                    default: 0.0
                },
                {
                    name: "current_z",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
                {
                    name: "force_z",
                    datatype: "real",
                    si_unit: "N",
                    default: 0.0
                },
                {
                    name: "power_z",
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
                    name: "limit_switch_0_z",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
                {
                    name: "limit_switch_1_z",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
                {
                    name: "gripper_open",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
                {
                    name: "gripper_closed",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
                {
                    name: "gripper_number",
                    datatype: "real",
                    si_unit: "enum",
                    default: 0.0
                },
                {
                    name: "gripper_ventils",
                    datatype: "real",
                    si_unit: "Boolean",
                    default: 0.0
                },
                {
                    name: "gripper_power",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
                {
                    name: "SentronPAC_power",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
                {
                    name: "SentronPAC_current",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
                {
                    name: "SentronPAC_TotalEnergy",
                    datatype: "real",
                    si_unit: "W",
                    default: 0.0
                },
                {
                    name: "SentronPAC_Voltage",
                    datatype: "real",
                    si_unit: "V",
                    default: 0.0
                },
                {
                    name: "SystemOperationMode",
                    datatype: "real",
                    si_unit: "Mode",
                    default: 0.0
                },
                {
                    name: "UserOperationMode",
                    datatype: "real",
                    si_unit: "Mode",
                    default: 0.0
                },
                {
                    name: "timestamp",
                    datatype: "real",
                    si_unit: "time",
                    default: 0.0
                },
                {
                    name: "data_quality",
                    datatype: "real",
                    si_unit: "quality",
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
                listener_port: 3461
            },
            outputs_variables: [{
                name: "FAPS_DemonstratorProgramToCloud_Input",
                datatype: "object",
                si_unit: "-",
                default: {}
            }],
            system: false
        },
        amqpInputProgram: {
            id: "DemonstratorProgramFromCloud",
            name: "DemonstratorProgramFromCloud",
            type: "AMQPInputStreamer",
            level: "info",
            modulesetting: {
                ip: "amqp://esys:esys@131.188.113.59",
                exchange: 'AMQPStreamer_Exchange_ProgramFromCloud',
                queue: 'DemonstratorProgramFromCloud'
            },
            outputs_variables: [{
                name: "FAPS_DemonstratorProgramFromCloud_Input",
                datatype: "Object",
                si_unit: "",
                default: {}
            }],
            system: false
        }
    },
    northbounds: {
        amqp0: {
            id: "AMQPStreamer_1",
            name: "AMQPStreamer",
            type: "AMQPStreamer",
            level: "info",
            modulesetting: {
                ip: "amqp://esys:esys@131.188.113.59"
            },
            inputs_variables: [{
                    name: "acceleration_x",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "acceleration_y",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "acceleration_z",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "speed_x",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "speed_y",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "speed_z",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "encoder_values_x",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "encoder_values_y",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "encoder_values_z",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "torque_x",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "torque_y",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                },
                {
                    name: "torque_z",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
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
                exchange: 'AMQPStreamer_Exchange_ProgramToCloud',
                queue: 'DemonstratorProgramToCloud'
            },
            inputs_variables: [{
                name: "FAPS_DemonstratorProgramToCloud_Output",
                datatype: "Object",
                si_unit: "",
                default: {}
            }],
            system: false
        },
        FAPS_ProgramWriter: {
            id: "fg46etwet",
            name: "FAPS_ProgramWriter",
            type: "DemonstratorProgramWriter",
            level: "info",
            modulesetting: {
                client_host: '192.168.1.1',
                client_port: 28920
            },
            inputs_variables: [{
                name: "FAPS_DemonstratorProgramFromCloud_Output",
                datatype: "object",
                si_unit: "-",
                default: {}
            }],
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
                            name: "encoder_values_x",
                            label: "",
                            datatype: "real",
                            si_unit: "increment",
                            default: 0.0,
                            type: "base_input",
                            variable: "encoder_values_x"
                        }],
                        outputs: [{
                            name: "encoder_values_x",
                            label: "",
                            datatype: "real",
                            si_unit: "increment",
                            default: 0.0,
                            type: "base_output",
                            variable: "encoder_values_x"
                        }]
                    },
                    cont_LCOM_1: {
                        id: "cont_LCOM_1",
                        name: "cont_LCOM_1",
                        type: "FORWARD",
                        inputs: [{
                            name: "acceleration_x",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s²",
                            default: 0.0,
                            type: "base_input",
                            variable: "acceleration_x"
                        }],
                        outputs: [{
                            name: "acceleration_x",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s²",
                            default: 0.0,
                            type: "base_output",
                            variable: "acceleration_x"
                        }]
                    },
                    cont_LCOM_2: {
                        id: "cont_LCOM_2",
                        name: "cont_LCOM_2",
                        type: "FORWARD",
                        inputs: [{
                            name: "speed_x",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s",
                            default: 0.0,
                            type: "base_input",
                            variable: "speed_x"
                        }],
                        outputs: [{
                            name: "speed_x",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s",
                            default: 0.0,
                            type: "base_output",
                            variable: "speed_x"
                        }]
                    },
                    cont_LCOM_3: {
                        id: "cont_LCOM_3",
                        name: "cont_LCOM_3",
                        type: "FORWARD",
                        inputs: [{
                            name: "torque_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Nm",
                            default: 0.0,
                            type: "base_input",
                            variable: "torque_x"
                        }],
                        outputs: [{
                            name: "torque_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Nm",
                            default: 0.0,
                            type: "base_output",
                            variable: "torque_x"
                        }]
                    },
                    cont_LCOM_4: {
                        id: "cont_LCOM_4",
                        name: "cont_LCOM_4",
                        type: "FORWARD",
                        inputs: [{
                            name: "current_x",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_input",
                            variable: "current_x"
                        }],
                        outputs: [{
                            name: "current_x",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_output",
                            variable: "current_x"
                        }]
                    },
                    cont_LCOM_5: {
                        id: "cont_LCOM_5",
                        name: "cont_LCOM_5",
                        type: "FORWARD",
                        inputs: [{
                            name: "force_x",
                            label: "",
                            datatype: "real",
                            si_unit: "N",
                            default: 0.0,
                            type: "base_input",
                            variable: "force_x"
                        }],
                        outputs: [{
                            name: "force_x",
                            label: "",
                            datatype: "real",
                            si_unit: "N",
                            default: 0.0,
                            type: "base_output",
                            variable: "force_x"
                        }]
                    },
                    cont_LCOM_6: {
                        id: "cont_LCOM_6",
                        name: "cont_LCOM_6",
                        type: "FORWARD",
                        inputs: [{
                            name: "power_x",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_input",
                            variable: "power_x"
                        }],
                        outputs: [{
                            name: "power_x",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "power_x"
                        }]
                    },
                    cont_LCOM_7: {
                        id: "cont_LCOM_7",
                        name: "cont_LCOM_7",
                        type: "FORWARD",
                        inputs: [{
                            name: "driveEnabled_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "driveEnabled_x"
                        }],
                        outputs: [{
                            name: "driveEnabled_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "driveEnabled_x"
                        }]
                    },
                    cont_LCOM_8: {
                        id: "cont_LCOM_8",
                        name: "cont_LCOM_8",
                        type: "FORWARD",
                        inputs: [{
                            name: "limit_switch_0_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "limit_switch_0_x"
                        }],
                        outputs: [{
                            name: "limit_switch_0_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "limit_switch_0_x"
                        }]
                    },
                    cont_LCOM_9: {
                        id: "cont_LCOM_9",
                        name: "cont_LCOM_9",
                        type: "FORWARD",
                        inputs: [{
                            name: "limit_switch_1_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "limit_switch_1_x"
                        }],
                        outputs: [{
                            name: "limit_switch_1_x",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "limit_switch_1_x"
                        }]
                    },
                    cont_LCOM_10: {
                        id: "cont_LCOM_10",
                        name: "cont_LCOM_10",
                        type: "FORWARD",
                        inputs: [{
                            name: "encoder_values_y",
                            label: "",
                            datatype: "real",
                            si_unit: "increment",
                            default: 0.0,
                            type: "base_input",
                            variable: "encoder_values_y"
                        }],
                        outputs: [{
                            name: "encoder_values_y",
                            label: "",
                            datatype: "real",
                            si_unit: "increment",
                            default: 0.0,
                            type: "base_output",
                            variable: "encoder_values_y"
                        }]
                    },
                    cont_LCOM_11: {
                        id: "cont_LCOM_11",
                        name: "cont_LCOM_11",
                        type: "FORWARD",
                        inputs: [{
                            name: "acceleration_y",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s²",
                            default: 0.0,
                            type: "base_input",
                            variable: "acceleration_y"
                        }],
                        outputs: [{
                            name: "acceleration_y",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s²",
                            default: 0.0,
                            type: "base_output",
                            variable: "acceleration_y"
                        }]
                    },
                    cont_LCOM_12: {
                        id: "cont_LCOM_12",
                        name: "cont_LCOM_12",
                        type: "FORWARD",
                        inputs: [{
                            name: "speed_y",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s",
                            default: 0.0,
                            type: "base_input",
                            variable: "speed_y"
                        }],
                        outputs: [{
                            name: "speed_y",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s",
                            default: 0.0,
                            type: "base_output",
                            variable: "speed_y"
                        }]
                    },
                    cont_LCOM_13: {
                        id: "cont_LCOM_13",
                        name: "cont_LCOM_13",
                        type: "FORWARD",
                        inputs: [{
                            name: "torque_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Nm",
                            default: 0.0,
                            type: "base_input",
                            variable: "torque_y"
                        }],
                        outputs: [{
                            name: "torque_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Nm",
                            default: 0.0,
                            type: "base_output",
                            variable: "torque_y"
                        }]
                    },
                    cont_LCOM_14: {
                        id: "cont_LCOM_14",
                        name: "cont_LCOM_14",
                        type: "FORWARD",
                        inputs: [{
                            name: "current_y",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_input",
                            variable: "current_y"
                        }],
                        outputs: [{
                            name: "current_y",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_output",
                            variable: "current_y"
                        }]
                    },
                    cont_LCOM_15: {
                        id: "cont_LCOM_15",
                        name: "cont_LCOM_15",
                        type: "FORWARD",
                        inputs: [{
                            name: "force_y",
                            label: "",
                            datatype: "real",
                            si_unit: "N",
                            default: 0.0,
                            type: "base_input",
                            variable: "force_y"
                        }],
                        outputs: [{
                            name: "force_y",
                            label: "",
                            datatype: "real",
                            si_unit: "N",
                            default: 0.0,
                            type: "base_output",
                            variable: "force_y"
                        }]
                    },
                    cont_LCOM_16: {
                        id: "cont_LCOM_16",
                        name: "cont_LCOM_16",
                        type: "FORWARD",
                        inputs: [{
                            name: "power_y",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_input",
                            variable: "power_y"
                        }],
                        outputs: [{
                            name: "power_y",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "power_y"
                        }]
                    },
                    cont_LCOM_17: {
                        id: "cont_LCOM_17",
                        name: "cont_LCOM_17",
                        type: "FORWARD",
                        inputs: [{
                            name: "driveEnabled_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "driveEnabled_y"
                        }],
                        outputs: [{
                            name: "driveEnabled_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "driveEnabled_y"
                        }]
                    },
                    cont_LCOM_18: {
                        id: "cont_LCOM_18",
                        name: "cont_LCOM_18",
                        type: "FORWARD",
                        inputs: [{
                            name: "limit_switch_0_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "limit_switch_0_y"
                        }],
                        outputs: [{
                            name: "limit_switch_0_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "limit_switch_0_y"
                        }]
                    },
                    cont_LCOM_19: {
                        id: "cont_LCOM_19",
                        name: "cont_LCOM_19",
                        type: "FORWARD",
                        inputs: [{
                            name: "limit_switch_1_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "limit_switch_1_y"
                        }],
                        outputs: [{
                            name: "limit_switch_1_y",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "limit_switch_1_y"
                        }]
                    },
                    cont_LCOM_20: {
                        id: "cont_LCOM_20",
                        name: "cont_LCOM_20",
                        type: "FORWARD",
                        inputs: [{
                            name: "encoder_values_z",
                            label: "",
                            datatype: "real",
                            si_unit: "increment",
                            default: 0.0,
                            type: "base_input",
                            variable: "encoder_values_z"
                        }],
                        outputs: [{
                            name: "encoder_values_z",
                            label: "",
                            datatype: "real",
                            si_unit: "increment",
                            default: 0.0,
                            type: "base_output",
                            variable: "encoder_values_z"
                        }]
                    },
                    cont_LCOM_21: {
                        id: "cont_LCOM_21",
                        name: "cont_LCOM_21",
                        type: "FORWARD",
                        inputs: [{
                            name: "acceleration_z",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s²",
                            default: 0.0,
                            type: "base_input",
                            variable: "acceleration_z"
                        }],
                        outputs: [{
                            name: "acceleration_z",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s²",
                            default: 0.0,
                            type: "base_output",
                            variable: "acceleration_z"
                        }]
                    },
                    cont_LCOM_22: {
                        id: "cont_LCOM_22",
                        name: "cont_LCOM_22",
                        type: "FORWARD",
                        inputs: [{
                            name: "speed_z",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s",
                            default: 0.0,
                            type: "base_input",
                            variable: "speed_z"
                        }],
                        outputs: [{
                            name: "speed_z",
                            label: "",
                            datatype: "real",
                            si_unit: "m/s",
                            default: 0.0,
                            type: "base_output",
                            variable: "speed_z"
                        }]
                    },
                    cont_LCOM_23: {
                        id: "cont_LCOM_23",
                        name: "cont_LCOM_23",
                        type: "FORWARD",
                        inputs: [{
                            name: "torque_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Nm",
                            default: 0.0,
                            type: "base_input",
                            variable: "torque_z"
                        }],
                        outputs: [{
                            name: "torque_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Nm",
                            default: 0.0,
                            type: "base_output",
                            variable: "torque_z"
                        }]
                    },
                    cont_LCOM_24: {
                        id: "cont_LCOM_24",
                        name: "cont_LCOM_24",
                        type: "FORWARD",
                        inputs: [{
                            name: "current_z",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_input",
                            variable: "current_z"
                        }],
                        outputs: [{
                            name: "current_z",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_output",
                            variable: "current_z"
                        }]
                    },
                    cont_LCOM_25: {
                        id: "cont_LCOM_25",
                        name: "cont_LCOM_25",
                        type: "FORWARD",
                        inputs: [{
                            name: "force_z",
                            label: "",
                            datatype: "real",
                            si_unit: "N",
                            default: 0.0,
                            type: "base_input",
                            variable: "force_z"
                        }],
                        outputs: [{
                            name: "force_z",
                            label: "",
                            datatype: "real",
                            si_unit: "N",
                            default: 0.0,
                            type: "base_output",
                            variable: "force_z"
                        }]
                    },
                    cont_LCOM_26: {
                        id: "cont_LCOM_26",
                        name: "cont_LCOM_26",
                        type: "FORWARD",
                        inputs: [{
                            name: "power_z",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_input",
                            variable: "power_z"
                        }],
                        outputs: [{
                            name: "power_z",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "power_z"
                        }]
                    },
                    cont_LCOM_27: {
                        id: "cont_LCOM_27",
                        name: "cont_LCOM_27",
                        type: "FORWARD",
                        inputs: [{
                            name: "driveEnabled_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "driveEnabled_z"
                        }],
                        outputs: [{
                            name: "driveEnabled_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "driveEnabled_z"
                        }]
                    },
                    cont_LCOM_28: {
                        id: "cont_LCOM_28",
                        name: "cont_LCOM_28",
                        type: "FORWARD",
                        inputs: [{
                            name: "limit_switch_0_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "limit_switch_0_z"
                        }],
                        outputs: [{
                            name: "limit_switch_0_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "limit_switch_0_z"
                        }]
                    },
                    cont_LCOM_29: {
                        id: "cont_LCOM_29",
                        name: "cont_LCOM_29",
                        type: "FORWARD",
                        inputs: [{
                            name: "limit_switch_1_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "limit_switch_1_z"
                        }],
                        outputs: [{
                            name: "limit_switch_1_z",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "limit_switch_1_z"
                        }]
                    },
                    cont_LCOM_30: {
                        id: "cont_LCOM_30",
                        name: "cont_LCOM_30",
                        type: "FORWARD",
                        inputs: [{
                            name: "gripper_open",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "gripper_open"
                        }],
                        outputs: [{
                            name: "gripper_open",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "gripper_open"
                        }]
                    },
                    cont_LCOM_31: {
                        id: "cont_LCOM_31",
                        name: "cont_LCOM_31",
                        type: "FORWARD",
                        inputs: [{
                            name: "gripper_closed",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "gripper_closed"
                        }],
                        outputs: [{
                            name: "gripper_closed",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "gripper_closed"
                        }]
                    },
                    cont_LCOM_32: {
                        id: "cont_LCOM_32",
                        name: "cont_LCOM_32",
                        type: "FORWARD",
                        inputs: [{
                            name: "gripper_number",
                            label: "",
                            datatype: "real",
                            si_unit: "enum",
                            default: 0.0,
                            type: "base_input",
                            variable: "gripper_number"
                        }],
                        outputs: [{
                            name: "gripper_number",
                            label: "",
                            datatype: "real",
                            si_unit: "enum",
                            default: 0.0,
                            type: "base_output",
                            variable: "gripper_number"
                        }]
                    },
                    cont_LCOM_33: {
                        id: "cont_LCOM_33",
                        name: "cont_LCOM_33",
                        type: "FORWARD",
                        inputs: [{
                            name: "gripper_ventils",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_input",
                            variable: "gripper_ventils"
                        }],
                        outputs: [{
                            name: "gripper_ventils",
                            label: "",
                            datatype: "real",
                            si_unit: "Boolean",
                            default: 0.0,
                            type: "base_output",
                            variable: "gripper_ventils"
                        }]
                    },
                    cont_LCOM_34: {
                        id: "cont_LCOM_34",
                        name: "cont_LCOM_34",
                        type: "FORWARD",
                        inputs: [{
                            name: "gripper_power",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_input",
                            variable: "gripper_power"
                        }],
                        outputs: [{
                            name: "gripper_power",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "gripper_power"
                        }]
                    },
                    cont_LCOM_35: {
                        id: "cont_LCOM_35",
                        name: "cont_LCOM_35",
                        type: "FORWARD",
                        inputs: [{
                            name: "SentronPAC_power",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_input",
                            variable: "SentronPAC_power"
                        }],
                        outputs: [{
                            name: "SentronPAC_power",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "SentronPAC_power"
                        }]
                    },
                    cont_LCOM_36: {
                        id: "cont_LCOM_36",
                        name: "cont_LCOM_36",
                        type: "FORWARD",
                        inputs: [{
                            name: "SentronPAC_current",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_input",
                            variable: "SentronPAC_current"
                        }],
                        outputs: [{
                            name: "SentronPAC_current",
                            label: "",
                            datatype: "real",
                            si_unit: "A",
                            default: 0.0,
                            type: "base_output",
                            variable: "SentronPAC_current"
                        }]
                    },
                    cont_LCOM_37: {
                        id: "cont_LCOM_37",
                        name: "cont_LCOM_37",
                        type: "FORWARD",
                        inputs: [{
                            name: "SentronPAC_TotalEnergy",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_input",
                            variable: "SentronPAC_TotalEnergy"
                        }],
                        outputs: [{
                            name: "SentronPAC_TotalEnergy",
                            label: "",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "SentronPAC_TotalEnergy"
                        }]
                    },
                    cont_LCOM_38: {
                        id: "cont_LCOM_38",
                        name: "cont_LCOM_38",
                        type: "FORWARD",
                        inputs: [{
                            name: "SentronPAC_Voltage",
                            label: "",
                            datatype: "real",
                            si_unit: "V",
                            default: 0.0,
                            type: "base_input",
                            variable: "SentronPAC_Voltage"
                        }],
                        outputs: [{
                            name: "SentronPAC_Voltage",
                            label: "",
                            datatype: "real",
                            si_unit: "V",
                            default: 0.0,
                            type: "base_output",
                            variable: "SentronPAC_Voltage"
                        }]
                    },
                    cont_LCOM_39: {
                        id: "cont_LCOM_39",
                        name: "cont_LCOM_39",
                        type: "FORWARD",
                        inputs: [{
                            name: "SystemOperationMode",
                            label: "",
                            datatype: "real",
                            si_unit: "Mode",
                            default: 0.0,
                            type: "base_input",
                            variable: "SystemOperationMode"
                        }],
                        outputs: [{
                            name: "SystemOperationMode",
                            label: "",
                            datatype: "real",
                            si_unit: "Mode",
                            default: 0.0,
                            type: "base_output",
                            variable: "SystemOperationMode"
                        }]
                    },
                    cont_LCOM_40: {
                        id: "cont_LCOM_40",
                        name: "cont_LCOM_40",
                        type: "FORWARD",
                        inputs: [{
                            name: "UserOperationMode",
                            label: "",
                            datatype: "real",
                            si_unit: "Mode",
                            default: 0.0,
                            type: "base_input",
                            variable: "UserOperationMode"
                        }],
                        outputs: [{
                            name: "UserOperationMode",
                            label: "",
                            datatype: "real",
                            si_unit: "Mode",
                            default: 0.0,
                            type: "base_output",
                            variable: "UserOperationMode"
                        }]
                    },
                    cont_LCOM_41: {
                        id: "cont_LCOM_41",
                        name: "cont_LCOM_41",
                        type: "FORWARD",
                        inputs: [{
                            name: "timestamp",
                            label: "",
                            datatype: "real",
                            si_unit: "time",
                            default: 0.0,
                            type: "base_input",
                            variable: "timestamp"
                        }],
                        outputs: [{
                            name: "timestamp",
                            label: "",
                            datatype: "real",
                            si_unit: "time",
                            default: 0.0,
                            type: "base_output",
                            variable: "timestamp"
                        }]
                    },
                    cont_LCOM_42: {
                        id: "cont_LCOM_42",
                        name: "cont_LCOM_42",
                        type: "FORWARD",
                        inputs: [{
                            name: "data_quality",
                            label: "",
                            datatype: "real",
                            si_unit: "quality",
                            default: 0.0,
                            type: "base_input",
                            variable: "data_quality"
                        }],
                        outputs: [{
                            name: "data_quality",
                            label: "",
                            datatype: "real",
                            si_unit: "quality",
                            default: 0.0,
                            type: "base_output",
                            variable: "data_quality"
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
                    }
                }
            }
        }
    }
};
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
            port: 8088
        },
        {
            name: "EberleinApi",
            type: "Swagger",
            port: 8089
        }
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
        lcom: {
            id: "67435124_LCOM",
            name: "LCOM_Dummy",
            type: "LCOM",
            level: "info",
            modulesetting: {
                port: 1000,
                paket_length: 8
            },
            outputs_variables: [{
                    name: "LCOM_1",
                    datatype: "real",
                    si_unit: "A",
                    default: 0.0
                },
                {
                    name: "LCOM_2",
                    datatype: "real",
                    si_unit: "V",
                    default: 0.0
                },
                {
                    name: "LCOM_3",
                    datatype: "real",
                    si_unit: "s",
                    default: 0.0
                }
            ],
            system: false
        },
        opcua: {
            id: "341233",
            name: "DAISY_Client",
            type: "opcuaClientManager",
            level: "info",
            modulesetting: {
                interval: 100,
                server_adress: "127.0.0.1",
                port: 48030
            },
            outputs_variables: [{
                name: "OPCVar",
                datatype: "real",
                si_unit: "%",
                default: 0.0,
                nodeId: {
                    ns: 4,
                    nid: "Demo.Dynamic.Scalar.Double", //nid:7995,
                    interval: 100
                }
            }]
        }
    },
    northbounds: {
        // Only dummy is currently supported
        dummy: {
            id: "67435124",
            name: "N_Dummy",
            type: "dummyServer",
            level: "info",
            modulesetting: {},
            inputs_variables: [{
                name: "P2",
                datatype: "real",
                si_unit: "Watt",
                default: 0.0
            }],
            system: false
        },
        wss0: {
            id: "6743534",
            name: "WSStreamer",
            type: "WSStreamer",
            level: "info",
            modulesetting: {
                port: 1919
            },
            inputs_variables: [{
                name: "P3",
                datatype: "real",
                si_unit: "Watt",
                default: 0.0
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
                    sseese: {
                        id: "sseese",
                        name: "MyContainer",
                        type: "MULT2",
                        inputs: [{
                                name: "U",
                                label: "U(V)",
                                datatype: "real",
                                si_unit: "V",
                                default: 0.0,
                                type: "base_input",
                                variable: "U"
                            },
                            {
                                name: "I",
                                label: "I(A)",
                                datatype: "real",
                                si_unit: "A",
                                default: 0.0,
                                type: "base_input",
                                variable: "I"
                            }
                        ],
                        outputs: [{
                            name: "P1",
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
                                name: "OPCVar",
                                label: "OPCVar",
                                datatype: "real",
                                si_unit: "V",
                                default: 0.0,
                                type: "base_input",
                                variable: "OPCVar"
                            },
                            {
                                name: "t",
                                label: "t",
                                datatype: "real",
                                si_unit: "",
                                default: 0.0,
                                type: "base_input",
                                variable: "t"
                            }
                        ],
                        outputs: [{
                            name: "P2",
                            label: "P2(W)",
                            datatype: "real",
                            si_unit: "W",
                            default: 0.0,
                            type: "base_output",
                            variable: "P2"
                        }]
                    }
                }
            }
        }
    }
};
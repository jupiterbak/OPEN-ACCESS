'use strict';
var _manager = require('../DAISYOPCClientManager');

exports.modelsGET = function (args, res, next) {
    /**
     * Mechatronic component model list.
     * The models endpoint returns information about founded model of a specific PLC. The response includes a list of models of all mechatronic components found in the targeted machine.
     *
     * ip String IP address of the target machine.
     * port Integer TCP/IP Port of the target machine.
     * servername String Name of the server
     * returns List
     **/

    var examples = {};
    examples['application/json'] = [{
        "name": "aeiou",
        "id": "aeiou",
        "display_name": "aeiou",
        "type": "aeiou",
        "write_mask": 1.3579000000000001069366817318950779736042022705078125
    }];

    var opcManager = _manager.getSingletonInstance();


    var ip = args.ip.value;
    var port = args.port.value;
    var servername = args.servername.value;

    var xclient;
    xclient = opcManager.getClient(opcManager.getClientID(ip, port, servername));

    if (xclient === undefined) {
        xclient = opcManager.addNewOPCClient(ip, port, servername);
        // find or instantiate a new client
        xclient.connect(ip, port, servername, function (err) {
            var reslt = {error: null};
            if (err) {

            } else {
                var results = [];
                xclient.findCMFunctionsObjects(xclient.targetNameSpace, xclient.targetNodeID, 'Objects', results, "PRESSESIMULATOR", function (praefix, item_result) {
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
    }

    setTimeout(function () {

        if (xclient.CMFunctions) {
            var values = {};
            var states = {};
            var errors = {};
            xclient.CMFunctions.forEach(function (CMFunc, function_index) {
                if (CMFunc['features']) {
                    CMFunc['features'].forEach(function(CMfeature, feature_index) {
                        if (CMfeature['values']) {
                            CMfeature['values'].forEach(function (CMfeatureValue, value_index) {
                                //val['path'] = CMfeatureValue.path;
                                //var tmp_key = CMfeatureValue.path;
                                var tmp_key_val = "val_" + function_index + "_" + feature_index + '_'+ value_index;

                                //var tmp_key = CMfeatureValue.node.nodeId.namespace + "_" + CMfeatureValue.node.nodeId.value;
                                xclient.monitorNode(CMfeatureValue.node.nodeId.namespace, CMfeatureValue.node.nodeId.value, CMfeatureValue.node.nodeId.value, 100, function (err) {
                                    if (err) {
                                        //break;
                                    } else {
                                        var m_text = (CMfeatureValue.node.displayName.text.indexOf("currentValue") !== -1)?CMfeature.node.displayName.text:CMfeature.node.displayName.text + "_" + CMfeatureValue.node.displayName.text;
                                        values[tmp_key_val] = {
                                            'show':!CMfeatureValue['derived'],
                                            'text': m_text,
                                            'type': "number",
                                            'path': CMfeatureValue.path
                                            // ,'unit': "-",
                                            // 'min': "0",
                                            // 'max': "0",
                                            // 'fixed': "1",
                                            // 'spc': true,
                                            // 'derive' : function(){
                                            //
                                            // }
                                        };
                                        //claient.v
                                    }
                                }, function (new_value) {
                                    xclient.socketHandler.emit(tmp_key_val, ""+ new_value);

                                    // xclient.CMMonitoredItems[CMfeatureValue.path] = {
                                    //     id:tmp_key_val,
                                    //     path: CMfeatureValue.path,
                                    //     value: new_value,
                                    //     node: CMfeatureValue.node
                                    // };
                                    // Update FireBaseData
                                });
                            });
                        }
                    });
                }

                if (CMFunc['conditionState']) {
                    //var tmp_key = CMFunc['conditionState'][0].path;
                    var tmp_key_cond = "condState_" + function_index;
                    //var tmp_key = CMFunc['conditionState'][0].node.nodeId.namespace + "_" + CMFunc['conditionState'][0].node.nodeId.value;
                    var m_text = CMFunc.node.displayName.text + "_" + CMFunc['conditionState'][0].node.displayName.text;
                    states[tmp_key_cond] = {
                        'text': m_text,
                        'path': CMFunc['conditionState'][0].path
                    };

                    xclient.monitorNode(CMFunc['conditionState'][0].node.nodeId.namespace, CMFunc['conditionState'][0].node.nodeId.value, CMFunc['conditionState'][0].node.nodeId.value, 100, function (err) {
                        if (err) {
                            //break;
                        } else {
                            //
                        }
                    }, function (new_value) {
                        xclient.socketHandler.emit(tmp_key_cond, ""+ new_value);
                        // xclient.CMMonitoredItems[CMFunc['conditionState'][0].path] = {
                        //     id:tmp_key_cond,
                        //     path: CMFunc['conditionState'][0].path,
                        //     state: new_value,
                        //     node: CMFunc['conditionState'][0].node
                        // };
                    });
                }
                if (CMFunc['statusWord']) {
                    //val['path'] = CMFunc['statusWord'][0].path;
                    //var tmp_key = CMFunc['statusWord'][0].path;
                    var tmp_key_sta = "staWord_" + function_index;
                    //var tmp_key = CMFunc['statusWord'][0].node.nodeId.namespace + "_" + CMFunc['statusWord'][0].node.nodeId.value;
                    var m_text = CMFunc.node.displayName.text + "_" + CMFunc['statusWord'][0].node.displayName.text;
                    states[tmp_key_sta] = {
                        "show": false,
                        'text': m_text,
                        'path':CMFunc['statusWord'][0].path
                    };
                    xclient.monitorNode(CMFunc['statusWord'][0].node.nodeId.namespace, CMFunc['statusWord'][0].node.nodeId.value, CMFunc['statusWord'][0].node.nodeId.value, 100, function (err) {
                        if (err) {
                            //break;
                        } else {
                            //
                        }
                    }, function (new_value) {
                        xclient.socketHandler.emit(tmp_key_sta, ""+ new_value);
                        // xclient.CMMonitoredItems[CMFunc['statusWord'][0].path] = {
                        //     id:tmp_key_sta,
                        //     path: CMFunc['statusWord'][0].path,
                        //     state: new_value,
                        //     node: CMFunc['statusWord'][0].node
                        // };
                    });
                }
                if (CMFunc['systemState']) {
                    //val['path'] = CMFunc['systemState'][0].path;
                    //var tmp_key = CMFunc['systemState'][0].path;
                    var tmp_key_sys = "sysState_" + function_index;
                    var m_text = CMFunc.node.displayName.text + "_" + CMFunc['systemState'][0].node.displayName.text;
                    states[tmp_key_sys] = {
                        'text': m_text,
                        'path':CMFunc['systemState'][0].path
                    };
                    //var tmp_key = CMFunc['systemState'][0].node.nodeId.namespace + "_" + CMFunc['systemState'][0].node.nodeId.value;
                    xclient.monitorNode(CMFunc['systemState'][0].node.nodeId.namespace, CMFunc['systemState'][0].node.nodeId.value, CMFunc['systemState'][0].node.nodeId.value, 100, function (err) {
                        if (err) {
                            //break;
                        } else {
                            //
                        }
                    }, function (new_value) {
                        xclient.socketHandler.emit(tmp_key_sta, ""+ new_value);
                        
                        // xclient.CMMonitoredItems[CMFunc['systemState'][0].path] = {
                        //     id:tmp_key_sys,
                        //     path: CMFunc['systemState'][0].path,
                        //     state: new_value,
                        //     node: CMFunc['systemState'][0].node
                        // };
                    });
                }
            });
        }

        setTimeout(function () {
            var rslt = {
                'values': values,
                'states': states,
                'errors': errors
            };

            xclient.locked = false;
            xclient.schema = rslt;

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.end(JSON.stringify(rslt, null, 2));
        }, 2000);

    }, 2000);
};


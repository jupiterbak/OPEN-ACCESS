'use strict';

var manager = require("../DAISYOPCClientManager");

exports.modelGET = function (args, res, next) {
    /**
     * Mechatronic component model.
     * The model endpoint returns information about specific model of a specific PLC. The response includes a list of models of all mechatronic components found in the targeted machine.
     *
     * model_id String Id of the model to retrieve.
     * returns Model
     **/
    var examples = {};
    examples['application/json'] = {
        "name": "aeiou",
        "id": "aeiou",
        "display_name": "aeiou",
        "type": "aeiou",
        "write_mask": 0
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }
}


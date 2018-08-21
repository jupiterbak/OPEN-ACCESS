'use strict';

exports.modelSchemaGET = function(args, res, next) {
  /**
   * Schema of all data variables, state variables and error state variables that a specific mechatronic component model can provide.
   * Schema of all data variables, state variables and error state variables that a specific mechatronic component model can provide. The response includes a combined schema of all data variable, state variable and error state variable provided by a specific model. 
   *
   * model_id String Id of the model whose data variables, state variables and error state variables will be retrieved in the future.
   * returns Schema
   **/
  var examples = {};
  examples['application/json'] = {
  "States" : [ {
    "path" : "aeiou",
    "show" : true,
    "text" : "aeiou"
  } ],
  "Errors" : [ {
    "code" : 123,
    "show" : true,
    "message" : "aeiou"
  } ],
  "Values" : [ {
    "path" : "aeiou",
    "show" : true,
    "text" : "aeiou",
    "type" : "aeiou"
  } ]
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}


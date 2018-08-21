'use strict';

exports.modelSocketPUT = function(args, res, next) {
  /**
   * Create a new websocket endpoint, subcribe to all data variables, state variables and error state variables of the specified model and return every value changes vis this websocket.
   *
   * model_id String Id of the model whose data variables, state variables and error state variables will be retrieved.
   * returns WebSocketEndpoint
   **/
  var examples = {};
  examples['application/json'] = {
  "url" : "aeiou"
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}


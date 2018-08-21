'use strict';

exports.heartbeatPUT = function(args, res, next) {
  /**
   * Send a heartbeat signal.
   *
   * ip String IP address of the sender.
   * returns Heartbeat
   **/
  var examples = {};
  examples['application/json'] = {
  "time" : 123,
  "type" : "aeiou",
  "message" : "aeiou"
};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}


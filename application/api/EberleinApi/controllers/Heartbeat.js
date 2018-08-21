'use strict';

var url = require('url');

var Heartbeat = require('./HeartbeatService');

module.exports.heartbeatPUT = function heartbeatPUT (req, res, next) {
  Heartbeat.heartbeatPUT(req.swagger.params, res, next);
};

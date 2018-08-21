'use strict';

var url = require('url');

var ModelWebsocket = require('./ModelWebsocketService');

module.exports.modelSocketPUT = function modelSocketPUT (req, res, next) {
  ModelWebsocket.modelSocketPUT(req.swagger.params, res, next);
};

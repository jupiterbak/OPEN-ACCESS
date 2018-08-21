'use strict';

var url = require('url');

var ValueStream = require('./ValueStreamService');

module.exports.getValueStream = function getValueStream (req, res, next) {
  ValueStream.getValueStream(req.swagger.params, res, next);
};

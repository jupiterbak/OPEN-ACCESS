'use strict';

var url = require('url');

var Variables = require('./VariablesService');

module.exports.getAvialableVariables = function getAvialableVariables (req, res, next) {
  Variables.getAvialableVariables(req.swagger.params, res, next);
};

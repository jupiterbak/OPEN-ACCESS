'use strict';

var url = require('url');

var Model = require('./ModelService');

module.exports.modelGET = function modelGET (req, res, next) {
  Model.modelGET(req.swagger.params, res, next);
};

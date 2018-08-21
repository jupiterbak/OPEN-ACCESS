'use strict';

var url = require('url');

var Schema = require('./SchemaService');

module.exports.modelSchemaGET = function modelSchemaGET (req, res, next) {
  Schema.modelSchemaGET(req.swagger.params, res, next);
};

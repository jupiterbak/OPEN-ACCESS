'use strict';

var url = require('url');

var Models = require('./ModelsService');

module.exports.modelsGET = function modelsGET (req, res, next) {
  Models.modelsGET(req.swagger.params, res, next);
};

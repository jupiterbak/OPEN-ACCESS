'use strict';

var url = require('url');

var Setting = require('./SettingService');

module.exports.getSetting = function getSetting (req, res, next) {
  Setting.getSetting(req.swagger.params, res, next);
};

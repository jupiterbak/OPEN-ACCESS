'use strict';

var url = require('url');

var Post_Settings = require('./Post_SettingsService');

module.exports.postSettings = function postSettings (req, res, next) {
  Post_Settings.postSettings(req.swagger.params, res, next);
};

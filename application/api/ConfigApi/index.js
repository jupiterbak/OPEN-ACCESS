/**
 * Copyright 2018 FAPS.
 *
 * File: api/ConfigApi/index.js
 * Project: SP 142
 * Author:
 *  - Jupiter Bakakeu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * --------------------------------------------------------------------
 * ###################### Changes #####################################
 * -- 28.11.2016
 *      Initial implementation
 * --------------------------------------------------------------------
 **/
'use strict';

var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  swaggerUi = require('swagger-ui-express');
var swagger_app = express();
var swagger_server = null;
var jsyaml = require('js-yaml');
var fs = require('fs');
var _serverPort = 8088;
var when = require('when');
var _app = null;
var _apiSettings = null;

// services
const setting_service = require('./controllers/SettingService');
const variable_service = require('./controllers/VariablesService');
const value_stream_service = require('./controllers/ValueStreamService');

module.exports = {
    
    server: swagger_app,
    init: function(app, apiSettings) {
        _app = app;
        _serverPort = apiSettings.port || _serverPort;
        _apiSettings = apiSettings;
        // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
        var spec = fs.readFileSync(__dirname + '/swagger/swagger.yaml', 'utf8');
        var swaggerDoc = jsyaml.safeLoad(spec);

        //rest API requirements
        swagger_app.use(bodyParser.urlencoded({
            extended: true
        }));
        swagger_app.use(bodyParser.json());

        router.route('/setting')
            .get(setting_service.getSetting)
            .post(setting_service.setSetting);

        router.route('/variables')
            .get(variable_service.getAvialableVariables);

        router.route('/valuestream')
            .get(value_stream_service.getValueStream);

        // swaggerRouter configuration
        var options = {
            explorer: true
        };
        swagger_app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, options));
        swagger_app.use('/api/v1', router);

        // log the step
        _app.engine.log.info("Config API initialized successfully.");
        return when.resolve();
    },
    start: function() {
        // Start all module
        // Start the server
        swagger_server = swagger_app.listen(_serverPort, function() {
            _app.engine.log.info('Config API is listening on port ' + _serverPort + ' (http://localhost:' + _serverPort + '/api/v1)');
            _app.engine.log.info('Config API Swagger-Ui is available on http://localhost:' + _serverPort + '/api-docs');
        });

        _app.engine.log.info("Config API started successfully.");
        return when.resolve();
    },
    stop: function() {
        // Close the server
        if(swagger_server){
            swagger_server.close(function() {
                _app.engine.log.info("Config API stopped successfully.");
            });
        }        
        _app.engine.log.info('Config API is closing the swagger server.');
        
        return when.resolve();
    },
    app: _app,
    settings: _apiSettings
};
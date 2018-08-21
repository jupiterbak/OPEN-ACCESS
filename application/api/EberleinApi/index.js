/**
 * Copyright 2018 FAPS.
 *
 * File: api/EberleinApi/index.js
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

var swagger_app = require('connect')();
var _http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var _serverPort = 8080;
var when = require('when');
var _app = null;
var _server = null;

module.exports = {
    app: _app,
    init: function(app, apiSettings) {
        _app = app;
        _serverPort = apiSettings.port || 8080;
        // swaggerRouter configuration
        var options = {
            swaggerUi: __dirname + '/swagger.json',
            controllers: __dirname + '/controllers',
            useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
        };

        // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
        var spec = fs.readFileSync(__dirname + '/swagger/swagger.yaml', 'utf8');
        var swaggerDoc = jsyaml.safeLoad(spec);

        // Initialize the Swagger middleware
        swaggerTools.initializeMiddleware(swaggerDoc, function(middleware) {
            // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
            swagger_app.use(middleware.swaggerMetadata());

            // Validate Swagger requests
            swagger_app.use(middleware.swaggerValidator());

            // Route validated requests to appropriate controller
            swagger_app.use(middleware.swaggerRouter(options));

            // Serve the Swagger documents and Swagger UI
            swagger_app.use(middleware.swaggerUi());
        });

        _server = _http.createServer(swagger_app);

        // log the step
        _app.engine.log.info("Eberlein API initialized successfully.");
        return when.resolve();
    },
    start: function() {
        // Start all module
        // Start the server
        _server.listen(_serverPort, function() {
            _app.engine.log.info('Eberlein API is listening on port ' + _serverPort + ' (http://localhost:' + _serverPort + ')');
            _app.engine.log.info('Eberlein API Swagger-ui is available on http://localhost:' + _serverPort + '/docs', _serverPort);
        });

        _app.engine.log.info("Configurator start successfully.");
        return when.resolve();
    },
    stop: function() {
        // Stop all modules

        // Close the server
        _server.close(function() {
            _app.engine.log.info('Eberlein API is closing the swagger server.');
        });

        _app.engine.log.info("Eberlein API stopped successfully.");
        return when.resolve();
    }
};
/**
 * Copyright 2018 FAPS.
 *
 * File: application/engine/dag/index.js
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

var clone = require("clone");
var when = require("when");

var DAG = require('./DAG');

var log = require("../log");
var OpenAccessUtil = require("../util");


var activeDAGs = {};
var activeDAGsConfig = {};
var started = false;
var activeNodesToDAG = {};

var typeEventRegistered = false;
var _engine = null;

function init(engine, userSettings) {
    if (started) {
        throw new Error("Cannot init without a stop");
    }
    var settings = userSettings;

    _engine = engine;
    started = false;
    if (!typeEventRegistered) {
        // Register all founded types
        /*
        events.on('type-registered',function(type) {
            if (activeDAGsConfig && activeDAGsConfig.missingTypes.length > 0) {
                var i = activeDAGsConfig.missingTypes.indexOf(type);
                if (i != -1) {
                    log.info(log._("nodes.flows.registered-missing", {type:type}));
                    activeDAGsConfig.missingTypes.splice(i,1);
                    if (activeDAGsConfig.missingTypes.length === 0 && started) {
                        start();
                    }
                }
            }
        });*/
        typeEventRegistered = true;
    }
    settings.flows = settings.flows || [];

    // Instantiates the different DAG and initialize them
    Object.keys(settings.flows).forEach(function(key) {
        var _dag = DAG.create(settings.flows[key], _engine);
        _dag.init(settings.flows[key]);
        activeDAGs[key] = _dag;
    });
    activeDAGsConfig = settings.flows;
}

function start(app) {
    Object.keys(activeDAGs).forEach(function(fkey) {
        var _dag = activeDAGs[fkey];
        _dag.start(app);
    });
    return when.resolve();
}

function stop(app) {
    Object.keys(activeDAGs).forEach(function(fkey) {
        var _dag = activeDAGs[fkey];
        _dag.stop(app);
    });
    return when.resolve();
}

function loadDAGs(app, dag_settings) {
    var dag_configs = dag_settings || {};
    if (started) {
        stop(app);
        //app.engine.settings.flows = clone(dag_settings);
        init(app.engine, clone(dag_settings));
        return start(app);
    } else {
        //app.engine.settings.flows = clone(dag_settings);
        init(app.engine, clone(dag_settings));
        return when.resolve();
    }
}

function setDAGs(app, _config) {
    var config = null;
    var newDAGConfig;

    config = clone(_config);

    // Check config TODO: Jupiter
    newDAGConfig = config;

    return loadDAGs(app, newDAGConfig);
}

function load(app) {
    return setDAGs(app, app.engine.settings.flows);
}


function addDAG(app, dag_config) {
    var i, _dag;
    _dag = dag_config || {};
    _dag.id = _dag.id || OpenAccessUtil.generateId();

    if (!dag_config.hasOwnProperty('containers')) {
        return when.reject(new Error('missing containers property'));
    }

    Object.keys(_dag.containers).forEach(function(key) {
        var node = getContainer(key);
        if (node !== null) {
            // TODO nls
            return when.reject(new Error('duplicate id'));
        }
    });

    var newConfig = clone(activeDAGsConfig);
    newConfig = newConfig[_dag.id] = _dag;

    return setDAGs(app, newConfig).then(function() {
        log.info("engine.flows.added-dags" + { label: (dag_config.label ? dag_config.label + " " : "") + "[" + dag_config.id + "]" });
        return _dag.id;
    });
}

function getDAG(id) {
    var dag;
    dag = activeDAGs[id];

    if (!dag) {
        return null;
    }

    var result = {
        id: id
    };
    if (dag.label) {
        result.label = dag.label;
    }
    if (dag.containers) {
        var nodeIds = Object.keys(dag.containers);
        if (nodeIds.length > 0) {
            result.containers = nodeIds.map(function(nodeId) {
                var node = clone(dag.containers[nodeId]);
                return node;
            })
        }
    }
    if (dag.name) {
        result.name = dag.name;
    }
    if (dag.type) {
        result.type = dag.type;
    }
    if (dag.author) {
        result.author = dag.author;
    }
    if (dag.version) {
        result.version = dag.version;
    }
    return result;
}

function updateDAG(app, id, newDAG) {
    var label = id;

    if (!activeDAGsConfig.flows[id]) {
        var e = new Error();
        e.code = 404;
        throw e;
    }
    label = activeDAGsConfig[id].label;

    var newConfig = clone(activeDAGsConfig);
    var nodes;
    var result = [];

    Object.keys(newConfig).forEach(function(key) {
        if (key === id) {
            delete newConfig[key];
        }
    });

    newConfig[id] = clone(newDAG);


    return setDAGs(app, newConfig).then(function() {
        log.info("engine.flows.updated-flow", { label: (label ? label + " " : "") + "[" + id + "]" });
    })
}

function removeDAG(app, id) {
    var dag = activeDAGsConfig[id];
    if (!dag) {
        return when.reject(new Error("dags doesn't exist"));
    }

    var newConfig = clone(activeDAGsConfig);

    Object.keys(newConfig).forEach(function(key) {
        if (newConfig[key].id === id) {
            delete newConfig[key]
        }
    });

    return setDAGs(app, newConfig).then(function() {
        log.info("engine.flows.removed-flow", { label: (dag.label ? dag.label + " " : "") + "[" + dag.id + "]" });
    });
}

function getContainer(id) {
    Object.keys(activeDAGsConfig).forEach(function(fkey) {
        var _dag = activeDAGsConfig[fkey];
        Object.keys(_dag).forEach(function(key) {
            if (id === key) {
                return activeDAGs[fkey].getContainer(key);
            }
        });
    });
    return null;
}

function eachNode(cb) {
    Object.keys(activeDAGs).forEach(function(fkey) {
        var _dag = activeDAGs[fkey];
        Object.keys(_dag.activeContainers).forEach(function(key) {
            cb(_dag.activeContainers[key]);
        });
    });
}

function getDAGs() {
    return activeDAGs;
}

function delegateError(node, logMessage, msg) {

}

function handleError(node, logMessage, msg) {

}

function delegateStatus(node, statusMessage) {

}

function handleStatus(node, statusMessage) {

}

module.exports = {
    init: init,

    /**
     * Load the current flow configuration from storage
     * @return a promise for the loading of the config
     */
    load: load,

    get: getContainer,
    eachNode: eachNode,

    /**
     * Gets the current flow configuration
     */
    getDAGs: getDAGs,
    setDAGs: setDAGs,

    /**
     * Starts the current flow configuration
     */
    startDAGs: start,

    /**
     * Stops the current flow configuration
     * @return a promise for the stopping of the flow
     */
    stopDAGs: stop,

    get started() { return started },

    handleError: handleError,
    handleStatus: handleStatus,

    addDAG: addDAG,
    getDAG: getDAG,
    updateDAG: updateDAG,
    removeDAG: removeDAG,
    disableDAG: null,
    enableDAG: null

};
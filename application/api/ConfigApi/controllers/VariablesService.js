'use strict';

exports.getAvialableVariables = function (args, res, next) {
    /**
     * Current Setting of the module.
     * The models endpoint returns information about the avialable variables of the engine.
     *
     * returns List
     **/

    var application = global.OPEN_ACCESS;
    var setting_manager = application.getSettingManager();
    var g_settings = setting_manager.getGlobalSetting();
    var rslts = [];

    if(g_settings.engine.flows){
        var keys = Object.keys(g_settings.engine.flows);
        for (var i=0, l=keys.length; i<l; i++) {
            var flow = g_settings.engine.flows[keys[i]];
            if(flow.containers){
                var keysc = Object.keys(flow.containers);
                for (var j=0, m=keysc.length; j<m; j++) {
                    var container = flow.containers[keysc[j]];
                    if(container.outputs){
                        container.outputs.forEach(function(output) {
                            if(output.type === "base_output"){
                                rslts.push(
                                    {
                                        "unit":output.si_unit,
                                        "default": output.default,
                                        "id": output.variable,
                                        "text": output.label,
                                        "type": output.datatype,
                                        "subtype": output.subtype || "string",
                                        "writable": 0x0,
                                        "min": output.min || 0,
                                        "max": output.max || 0,
                                        "show": output.show || true
                                    }
                                );
                            }
                        });
                    }
                }
            }
        }
    }

    var examples = {};
    examples['application/json'] = rslts;
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }
}


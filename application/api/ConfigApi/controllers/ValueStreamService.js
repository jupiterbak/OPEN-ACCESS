'use strict';
var ip = require('ip');

exports.getValueStream = function (args, res, next) {
    /**
     * Get the stream endpoint of a variable.
     * The valuestream endpoint returns a data stream configuration for a specifc variable.
     *
     * returns Object
     **/

    var application = global.OPEN_ACCESS;
    var setting_manager = application.getSettingManager();
    var configurator = application.getConfigurator();
    var g_settings = setting_manager.getGlobalSetting();
    var rslts = [];
    var streamer = 0;
    var north_els = configurator.getnorthboundsHandlers();

    north_els.forEach(function(n_el) {
        var set_ = n_el.getSettings();
        if(set_.type === "WSStreamer"){
            streamer = set_;
        }
    });

    var id = args.variable_id.value;

    var examples = {};
    if (id && streamer) {
        var rslt = {
            protocol:"Webscket",
            msg_id:id,
            full_uri: "ws://" + ip.address() + ":" + streamer.modulesetting.port
        };

        examples['application/json'] = rslt;

    } else {
        res.status(500);
        res.end(JSON.stringify({
            code: 404,
            message: "id must be specified",
            fields: variable_id
        }));
    }

    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }
};


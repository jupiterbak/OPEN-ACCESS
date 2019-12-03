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
    var rslts = {};
    var streamer = 0;
    var north_els = configurator.getnorthboundsHandlers();

    north_els.forEach(function(n_el) {
        var set_ = n_el.getSettings();
        if(set_.type === "WSStreamer"){
            streamer = set_;
        }
    });

    var id = args.query.ids;

    var examples = {};
    if (id && streamer) {
        rslts = {
            protocol:"Webscket",
            msg_id:id,
            full_uri: "ws://" + ip.address() + ":" + streamer.modulesetting.port
        };
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(rslts || {}, null, 2));
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            code: 404,
            message: "Couldn't find the sppecified output variable."
        }));
    }
    
    
};


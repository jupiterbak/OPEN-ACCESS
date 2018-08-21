'use strict';

exports.postSettings = function (args, res, next) {
    /**
     * Add/Update a Setting.
     *
     * key String key of the setting (optional)
     * value String value of the setting in JSON Format (optional)
     * returns Error
     **/

    var key = args.key.value;
    var txt = args.value.value;

    var application = global.OPEN_ACCESS;
    var storage = application.getStorage();
    var setting_manager = application.getSettingManager();
    var configurator = application.getConfigurator();
    var old = setting_manager.getGlobalSetting();


    setting_manager.set(key, JSON.parse(txt));
    var rslt = {
        "code": 0,
        "message": "OK!",
        "fields": ""
    };
    /*
    try {
        process.title = "Open Access Process SP 142 - Restarting";
        var server = application.getServer();
        setting_manager.set(key, JSON.parse(txt));
        application.stop();
        application.start().then(function () {
            process.title = "Open Access Process SP 142";
            rslt = {
                "code": 0,
                "message": "OK!",
                "fields": ""
            };
        }).otherwise(function (err) {
            console.log("Open Access failed-to-restart" + err);
            rslt = {
                "code": 0,
                "message": "Could not restart application",
                "fields": ""
            };
        });

    } catch (err) {
        console.log("Open Access failed-to-restart" + err);

        application.init(server, old);
        application.start().then(function () {
            process.title = "Open Access Process SP 142";
            rslt = {
                "code": 0,
                "message": "OK!",
                "fields": ""
            };
        }).otherwise(function (err) {
            console.log("Open Access failed-to-restart" + err);
            rslt = {
                "code": 0,
                "message": "Could not restart application",
                "fields": ""
            };

        });
    }
         */
    var examples = {};
    examples['application/json'] = rslt;

    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }
};


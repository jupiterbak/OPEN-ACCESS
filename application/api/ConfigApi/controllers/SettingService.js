'use strict';

exports.getSetting = function (args, res, next) {
    /**
     * Current Setting of the module.
     * The models endpoint returns information about the current settings of the engine.
     *
     * key String key of the setting (optional)
     * returns Object
     **/

    var application = global.OPEN_ACCESS;
    var setting_manager = application.getSettingManager();
    var _obj = {};
    
    var key = args.query.key;
    try {

        if(key){
            
            _obj = setting_manager.get(key);
        }else{
            _obj = setting_manager.getGlobalSetting();
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(_obj || {}, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            "code": 0x80000,
            "message": "Setting key doesn't exists!",
            "fields": "key"
          }, null, 2));
    }    
};

exports.setSetting = function (args, res, next) {
    /**
     * Current Setting of the module.
     * The models endpoint returns information about the current settings of the engine.
     *
     * key String key of the setting (optional)
     * returns Object
     **/

    var application = global.OPEN_ACCESS;
    var setting_manager = application.getSettingManager();
    
    var key = args.query.key;
    var value = args.body;
    try {
        if(key){            
            setting_manager.setFromAPI(key,value);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            "code": 0,
            "message": "Setting updated sucessfully!",
            "fields": "-"
          }, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            "code": 0x80000,
            "message": "Setting key doesn't exists!",
            "fields": "key"
          }, null, 2));
    }    
};


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
    var storage = application.getStorage();
    var setting_manager = application.getSettingManager();
    var configurator = application.getConfigurator();
    var examples = {};
    
    var key = args.key.value;
    
    if(key){
        examples['application/json'] = setting_manager.get(key);
    }else{
        examples['application/json'] = setting_manager.getGlobalSetting();
    }
    

    


    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }
}


/**
 * Copyright 2018 FAPS.
 * 
 * File: application/engine/settings.js
 * Project: SP 142
 * Author:
 *  - Jupiter Bakakeu
 *
 * This program is free software: you can redistribute it and/or modify  
 * it under the terms of the GNU General Public License as published by  
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License 
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 * 
 * --------------------------------------------------------------------
 * ###################### Changes #####################################
 * -- 28.11.2016
 *      Initial implementation
 * --------------------------------------------------------------------
 **/

var when = require("when");
var clone = require("clone");
var assert = require("assert");
var log = require("./engine/log");

var userSettings = null;
var globalSettings = null;
var storage = null;

var persistentSettings = {
    init: function(settings) {
        if (!settings) {
            return;
        }
        userSettings = settings;
        for (var i in settings) {
            if (settings.hasOwnProperty(i) && i !== 'load' && i !== 'get' && i !== 'set' && i !== 'available' && i !== 'reset') {
                // Don't allow any of the core functions get replaced via settings
                (function() {
                    var j = i;
                    persistentSettings.__defineGetter__(j, function() { return userSettings[j]; });
                    persistentSettings.__defineSetter__(j, function() { throw new Error("Property '" + j + "' is read-only"); });
                })();
            }
        }
        globalSettings = null;
    },
    load: function(_storage) {
        storage = _storage;
        return storage.getSettings().then(function(_settings) {
            globalSettings = _settings;
            return _settings;
        });
    },
    loadSync: function(_storage) {
        storage = _storage;
        const _set = storage.getSettingsSync();
        globalSettings = _set;
        return _set;
    },
    get: function(prop) {
        if (userSettings.hasOwnProperty(prop)) {
            return clone(userSettings[prop]);
        }
        if (globalSettings === null) {
            throw new Error(log._("settings.not-available"));
        }
        return clone(globalSettings[prop]);
    },

    set: function(prop, value) {
        this.loadSync(storage);
        if (globalSettings === null) {
            throw new Error(log.info("settings.not-available"));
        }
        var current = globalSettings[prop];
        globalSettings[prop] = value;
        try {
            assert.deepEqual(current, value);
            return when.resolve();
        } catch (err) {
            return storage.saveSettings(globalSettings);
        }
    },
    setFromAPI: function(prop, value) {
        this.loadSync(storage);
        if (globalSettings === null) {
            throw new Error(log.info("settings.not-available"));
        }
        var current = globalSettings[prop];
        globalSettings[prop] = value;
        try {
            assert.deepEqual(current, value);
            return when.resolve();
        } catch (err) {
            return storage.saveSettingsFromAPI(globalSettings);
        }
    },
    delete: function(prop) {
        if (userSettings.hasOwnProperty(prop)) {
            throw new Error(log.info("settings.property-read-only"));
        }
        if (globalSettings === null) {
            throw new Error(log.info("settings.not-available"));
        }
        if (globalSettings.hasOwnProperty(prop)) {
            delete globalSettings[prop];
            return storage.saveSettings(globalSettings);
        }
        return when.resolve();
    },

    available: function() {
        return (globalSettings !== null);
    },

    reset: function() {
        for (var i in userSettings) {
            /* istanbul ignore else */
            if (userSettings.hasOwnProperty(i)) {
                delete persistentSettings[i];
            }
        }
        userSettings = null;
        globalSettings = null;
        storage = null;
    },
    getGlobalSetting: function() { return globalSettings; },
    userSettings: userSettings
};

module.exports = persistentSettings;
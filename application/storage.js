/**
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
 **/

var fs = require('fs-extra');
var when = require('when');
var chokidar = require('chokidar');
var nodeFn = require('when/node/function');
var keys = require('when/keys');
var fspath = require("path");
var mkdirp = fs.mkdirs;

var log = require("./engine/log");

var promiseDir = nodeFn.lift(mkdirp);

var initialFlowLoadComplete = false;
var settings = {};
var configFile;
var configFullPath;
var globalSettingsFile;
var watcher;

var configChangeListener = [];

function getFileMeta(root, path) {
    var fn = fspath.join(root, path);
    var fd = fs.openSync(fn, "r");
    var size = fs.fstatSync(fd).size;
    var meta = {};
    var read = 0;
    var length = 10;
    var remaining = "";
    var buffer = Buffer(length);
    while (read < size) {
        read += fs.readSync(fd, buffer, 0, length);
        var data = remaining + buffer.toString();
        var parts = data.split("\n");
        remaining = parts.splice(-1);
        for (var i = 0; i < parts.length; i += 1) {
            var match = /^\/\/ (\w+): (.*)/.exec(parts[i]);
            if (match) {
                meta[match[1]] = match[2];
            } else {
                read = size;
                break;
            }
        }
    }
    fs.closeSync(fd);
    return meta;
}

function getFileBody(root, path) {
    var body = "";
    var fn = fspath.join(root, path);
    var fd = fs.openSync(fn, "r");
    var size = fs.fstatSync(fd).size;
    var scanning = true;
    var read = 0;
    var length = 50;
    var remaining = "";
    var buffer = Buffer(length);
    while (read < size) {
        var thisRead = fs.readSync(fd, buffer, 0, length);
        read += thisRead;
        if (scanning) {
            var data = remaining + buffer.slice(0, thisRead).toString();
            var parts = data.split("\n");
            remaining = parts.splice(-1)[0];
            for (var i = 0; i < parts.length; i += 1) {
                if (!/^\/\/ \w+: /.test(parts[i])) {
                    scanning = false;
                    body += parts[i] + "\n";
                }
            }
            if (!/^\/\/ \w+: /.test(remaining)) {
                scanning = false;
            }
            if (!scanning) {
                body += remaining;
            }
        } else {
            body += buffer.slice(0, thisRead).toString();
        }
    }
    fs.closeSync(fd);
    return body;
}

/**
 * Write content to a file using UTF8 encoding.
 * This forces a fsync before completing to ensure
 * the write hits disk.
 */
function writeFile(path, content) {
    return when.promise(function(resolve, reject) {
        var stream = fs.createWriteStream(path);
        stream.on('open', function(fd) {
            stream.end(content, 'utf8', function() {
                fs.fsync(fd, resolve);
            });
        });
        stream.on('error', function(err) {
            reject(err);
        });
    });
}


function readFile(path, backupPath, emptyResponse, type) {
    return when.promise(function(resolve) {
        fs.readFile(path, 'utf8', function(err, data) {
            if (!err) {
                if (data.length === 0) {
                    log.warn("storage.localfilesystem.empty");
                }
                try {
                    return resolve(JSON.parse(data));
                } catch (parseErr) {
                    log.warn("storage.localfilesystem.invalid");
                    return resolve(emptyResponse);
                }
            } else {
                resolve(emptyResponse);
            }
        });
    });
}

var localfilesystem = {
    init: function(userDir, json_path, default_settings) {
        var promises = [];
        configChangeListener = [];
        settings = default_settings;
        if (!userDir) {
            settings.userDir = fspath.normalize("../");
            settings.userDir = fspath.join(settings.userDir, ".open_access_settings");
        } else {
            settings.userDir = userDir;
        }

        if (!json_path) {
            configFile = 'settings_' + require('os').hostname() + '.json';
        } else {
            configFile = json_path;
        }
        configFullPath = fspath.join(settings.userDir, configFile);
        globalSettingsFile = configFullPath;

        if (fs.existsSync(globalSettingsFile)) {
            settings = this.getSettings();
        } else {
            this.saveSettings(settings);
        }
        var ffExt = fspath.extname(configFullPath);
        var ffName = fspath.basename(configFullPath);
        var ffBase = fspath.basename(configFullPath, ffExt);
        var ffDir = fspath.dirname(configFullPath);

        // Monitor the changes of the global file
        // watcher = chokidar.watch(globalSettingsFile, {
        //     ignored: /[\/\\]\./,
        //     persistent: true
        // });
        //
        // watcher.on('change', function(path, stats){
        //     configChangeListener.forEach(function(cb){
        //         cb(path,stats);
        //     });
        // });

        return when.all(promises);
    },
    getSettings: function() {
        return when.promise(function(resolve, reject) {
            fs.readFile(globalSettingsFile, 'utf8', function(err, data) {
                if (!err) {
                    try {
                        return resolve(JSON.parse(data));
                    } catch (err2) {
                        log.trace("Corrupted config detected - resetting");
                    }
                }
                return resolve({});
            })
        })
    },
    saveSettings: function(settings) {
        if (settings.readOnly) {
            return when.resolve();
        }
        return writeFile(globalSettingsFile, JSON.stringify(settings, null, 1));
    },
    addConfigFileListener: function(cb) {
        configChangeListener.push(cb);
    },
    getGlobalSettingsFile: function() {
            return globalSettingsFile;
        }
        //,
        // getFlows: function() {
        //     if (!initialFlowLoadComplete) {
        //         initialFlowLoadComplete = true;
        //         log.info(log._("storage.localfilesystem.user-dir",{path:settings.userDir}));
        //         log.info(log._("storage.localfilesystem.flows-file",{path:configFullPath}));
        //     }
        //     return readFile(configFullPath,flowsFileBackup,[],'flow');
        // },
        //
        // saveFlows: function(flows) {
        //     if (settings.readOnly) {
        //         return when.resolve();
        //     }
        //
        //     try {
        //         fs.renameSync(configFullPath,flowsFileBackup);
        //     } catch(err) {
        //     }
        //
        //     var flowData;
        //
        //     if (settings.flowFilePretty) {
        //         flowData = JSON.stringify(flows,null,4);
        //     } else {
        //         flowData = JSON.stringify(flows);
        //     }
        //     return writeFile(configFullPath, flowData);
        // }

    // getLibraryEntry: function(type,path) {
    //     var root = fspath.join(libDir,type);
    //     var rootPath = fspath.join(libDir,type,path);
    //     return promiseDir(root).then(function () {
    //         return nodeFn.call(fs.lstat, rootPath).then(function(stats) {
    //             if (stats.isFile()) {
    //                 return getFileBody(root,path);
    //             }
    //             if (path.substr(-1) == '/') {
    //                 path = path.substr(0,path.length-1);
    //             }
    //             return nodeFn.call(fs.readdir, rootPath).then(function(fns) {
    //                 var dirs = [];
    //                 var files = [];
    //                 fns.sort().filter(function(fn) {
    //                     var fullPath = fspath.join(path,fn);
    //                     var absoluteFullPath = fspath.join(root,fullPath);
    //                     if (fn[0] != ".") {
    //                         var stats = fs.lstatSync(absoluteFullPath);
    //                         if (stats.isDirectory()) {
    //                             dirs.push(fn);
    //                         } else {
    //                             var meta = getFileMeta(root,fullPath);
    //                             meta.fn = fn;
    //                             files.push(meta);
    //                         }
    //                     }
    //                 });
    //                 return dirs.concat(files);
    //             });
    //         }).otherwise(function(err) {
    //             if (type === "flows" && !/\.json$/.test(path)) {
    //                 return localfilesystem.getLibraryEntry(type,path+".json")
    //                     .otherwise(function(e) {
    //                         throw err;
    //                     });
    //             } else {
    //                 throw err;
    //             }
    //         });
    //     });
    // },
    // saveLibraryEntry: function(type,path,meta,body) {
    //     if (settings.readOnly) {
    //         return when.resolve();
    //     }
    //     var fn = fspath.join(libDir, type, path);
    //     var headers = "";
    //     for (var i in meta) {
    //         if (meta.hasOwnProperty(i)) {
    //             headers += "// "+i+": "+meta[i]+"\n";
    //         }
    //     }
    //     if (type === "flows" && settings.flowFilePretty) {
    //         body = JSON.stringify(JSON.parse(body),null,4);
    //     }
    //     return promiseDir(fspath.dirname(fn)).then(function () {
    //         writeFile(fn,headers+body);
    //     });
    // }
};

module.exports = localfilesystem;
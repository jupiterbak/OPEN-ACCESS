/**
 * Copyright 2018 FAPS.
 * 
 * File: application/engine/util.js
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

var clone = require("clone");

function generateId() {
    return (1 + Math.random() * 4294967295).toString(16);
}

function ensureString(o) {
    if (Buffer.isBuffer(o)) {
        return o.toString();
    } else if (typeof o === "object") {
        return JSON.stringify(o);
    } else if (typeof o === "string") {
        return o;
    }
    return "" + o;
}

function ensureBuffer(o) {
    if (Buffer.isBuffer(o)) {
        return o;
    } else if (typeof o === "object") {
        o = JSON.stringify(o);
    } else if (typeof o !== "string") {
        o = "" + o;
    }
    return new Buffer(o);
}

function cloneMessage(msg) {
    // Temporary fix for #97
    // TODO: remove this http-node-specific fix somehow
    var req = msg.req;
    var res = msg.res;
    delete msg.req;
    delete msg.res;
    var m = clone(msg);
    if (req) {
        m.req = req;
        msg.req = req;
    }
    if (res) {
        m.res = res;
        msg.res = res;
    }
    return m;
}

function compareObjects(obj1, obj2) {
    var i;
    if (obj1 === obj2) {
        return true;
    }
    if (obj1 == null || obj2 == null) {
        return false;
    }

    var isArray1 = Array.isArray(obj1);
    var isArray2 = Array.isArray(obj2);
    if (isArray1 != isArray2) {
        return false;
    }
    if (isArray1 && isArray2) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (i = 0; i < obj1.length; i++) {
            if (!compareObjects(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }
    var isBuffer1 = Buffer.isBuffer(obj1);
    var isBuffer2 = Buffer.isBuffer(obj2);
    if (isBuffer1 != isBuffer2) {
        return false;
    }
    if (isBuffer1 && isBuffer2) {
        if (obj1.equals) {
            // For node 0.12+ - use the native equals
            return obj1.equals(obj2);
        } else {
            if (obj1.length !== obj2.length) {
                return false;
            }
            for (i = 0; i < obj1.length; i++) {
                if (obj1.readUInt8(i) !== obj2.readUInt8(i)) {
                    return false;
                }
            }
            return true;
        }
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return false;
    }
    var keys1 = Object.keys(obj1);
    var keys2 = Object.keys(obj2);
    if (keys1.length != keys2.length) {
        return false;
    }
    for (var k in obj1) {
        /* istanbul ignore else */
        if (obj1.hasOwnProperty(k)) {
            if (!compareObjects(obj1[k], obj2[k])) {
                return false;
            }
        }
    }
    return true;
}

function normalisePropertyExpression(str) {
    var length = str.length;
    var parts = [];
    var start = 0;
    var inString = false;
    var inBox = false;
    var quoteChar;
    var v;
    for (var i = 0; i < length; i++) {
        var c = str[i];
        if (!inString) {
            if (c === "'" || c === '"') {
                if (!inBox) {
                    throw new Error("Invalid property expression: unexpected " + c + " at position " + i);
                }
                inString = true;
                quoteChar = c;
                start = i + 1;
            } else if (c === '.') {
                if (i === 0) {
                    throw new Error("Invalid property expression: unexpected . at position 0");
                }
                if (start != i) {
                    v = str.substring(start, i);
                    if (/^\d+$/.test(v)) {
                        parts.push(parseInt(v));
                    } else {
                        parts.push(v);
                    }
                }
                if (i === length - 1) {
                    throw new Error("Invalid property expression: unterminated expression");
                }
                // Next char is a-z
                if (!/[a-z0-9\$\_]/i.test(str[i + 1])) {
                    throw new Error("Invalid property expression: unexpected " + str[i + 1] + " at position " + (i + 1));
                }
                start = i + 1;
            } else if (c === '[') {
                if (i === 0) {
                    throw new Error("Invalid property expression: unexpected " + c + " at position " + i);
                }
                if (start != i) {
                    parts.push(str.substring(start, i));
                }
                if (i === length - 1) {
                    throw new Error("Invalid property expression: unterminated expression");
                }
                // Next char is either a quote or a number
                if (!/["'\d]/.test(str[i + 1])) {
                    throw new Error("Invalid property expression: unexpected " + str[i + 1] + " at position " + (i + 1));
                }
                start = i + 1;
                inBox = true;
            } else if (c === ']') {
                if (!inBox) {
                    throw new Error("Invalid property expression: unexpected " + c + " at position " + i);
                }
                if (start != i) {
                    v = str.substring(start, i);
                    if (/^\d+$/.test(v)) {
                        parts.push(parseInt(v));
                    } else {
                        throw new Error("Invalid property expression: unexpected array expression at position " + start);
                    }
                }
                start = i + 1;
                inBox = false;
            } else if (c === ' ') {
                throw new Error("Invalid property expression: unexpected ' ' at position " + i);
            }
        } else {
            if (c === quoteChar) {
                parts.push(str.substring(start, i));
                // Next char must be a ]
                if (!/\]/.test(str[i + 1])) {
                    throw new Error("Invalid property expression: unexpected array expression at position " + start);
                }
                start = i + 1;
                inString = false;
            }
        }

    }
    if (inBox || inString) {
        throw new Error("Invalid property expression: unterminated expression");
    }
    if (start < length) {
        parts.push(str.substring(start));
    }
    return parts;
}

function getMessageProperty(msg, expr) {
    var result = null;
    if (expr.indexOf('msg.') === 0) {
        expr = expr.substring(4);
    }
    var msgPropParts = normalisePropertyExpression(expr);
    var m;
    msgPropParts.reduce(function(obj, key) {
        result = (typeof obj[key] !== "undefined" ? obj[key] : undefined);
        return result;
    }, msg);
    return result;
}

function setMessageProperty(msg, prop, value, createMissing) {
    if (typeof createMissing === 'undefined') {
        createMissing = (typeof value !== 'undefined');
    }
    if (prop.indexOf('msg.') === 0) {
        prop = prop.substring(4);
    }
    var msgPropParts = normalisePropertyExpression(prop);
    var depth = 0;
    var length = msgPropParts.length;
    var obj = msg;
    var key;
    for (var i = 0; i < length - 1; i++) {
        key = msgPropParts[i];
        if (typeof key === 'string' || (typeof key === 'number' && !Array.isArray(obj))) {
            if (obj.hasOwnProperty(key)) {
                obj = obj[key];
            } else if (createMissing) {
                if (typeof msgPropParts[i + 1] === 'string') {
                    obj[key] = {};
                } else {
                    obj[key] = [];
                }
                obj = obj[key];
            } else {
                return null;
            }
        } else if (typeof key === 'number') {
            // obj is an array
            if (obj[key] === undefined) {
                if (createMissing) {
                    if (typeof msgPropParts[i + 1] === 'string') {
                        obj[key] = {};
                    } else {
                        obj[key] = [];
                    }
                    obj = obj[key];
                } else {
                    return null
                }
            } else {
                obj = obj[key];
            }
        }
    }
    key = msgPropParts[length - 1];
    if (typeof value === "undefined") {
        if (typeof key === 'number' && Array.isArray(obj)) {
            obj.splice(key, 1);
        } else {
            delete obj[key]
        }
    } else {
        obj[key] = value;
    }
}

function evaluateNodeProperty(value, type, node, msg) {
    if (type === 'str') {
        return "" + value;
    } else if (type === 'num') {
        return Number(value);
    } else if (type === 'json') {
        return JSON.parse(value);
    } else if (type === 're') {
        return new RegExp(value);
    } else if (type === 'date') {
        return Date.now();
    } else if (type === 'msg' && msg) {
        return getMessageProperty(msg, value);
    } else if (type === 'flow' && node) {
        return node.context().flow.get(value);
    } else if (type === 'global' && node) {
        return node.context().global.get(value);
    } else if (type === 'bool') {
        return /^true$/i.test(value);
    }
    return value;
}


module.exports = {
    ensureString: ensureString,
    ensureBuffer: ensureBuffer,
    cloneMessage: cloneMessage,
    compareObjects: compareObjects,
    generateId: generateId,
    getMessageProperty: getMessageProperty,
    setMessageProperty: setMessageProperty,
    evaluateNodeProperty: evaluateNodeProperty,
    normalisePropertyExpression: normalisePropertyExpression
};
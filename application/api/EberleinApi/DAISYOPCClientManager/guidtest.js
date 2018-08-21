var regexGUID = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/;
var isValidGuid = function (guid) {
    return regexGUID.test(guid);
};

var guidtest = function (nodeId) {

    var type;
    if (isValidGuid(nodeId)) {
        type = "g";
    }
    else if (isNaN(nodeId)) {
        type = "s";
    }
    else {
        type = "i";
    }
    return type;
}

module.exports = guidtest;
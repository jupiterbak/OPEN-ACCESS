// constructor function for the Cat class
var frameType = require('./Frame');

function PICTUREFRAMEFILTER() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.started = false;
}

PICTUREFRAMEFILTER.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

PICTUREFRAMEFILTER.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

PICTUREFRAMEFILTER.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

PICTUREFRAMEFILTER.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

PICTUREFRAMEFILTER.prototype.transmit = function (frame, socket) {
    if(!this.started) return;
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(frame, socket);
    }
};

PICTUREFRAMEFILTER.prototype.handleReceived = function (frame, socket) {
    if(!this.started) return;
    var self = this;
    if (!frame) return;
    if (!frame.isValid()) return;

    if (frame.header.Type === frameType.IMAGEFRAMETYPE || rame.header.Type === frameType.IDLEFRAMETYPE) {
        if (this.getUpperLayer()) {
            this.getUpperLayer().handleReceived(frame, socket);
        }
    }
    // else{
    //     if (this.getUpperLayer()) {
    //         this.getUpperLayer().handleReceived(frame, socket);
    //     }
    // }
    
};

PICTUREFRAMEFILTER.prototype.start = function() {
    this.started = true;
};

PICTUREFRAMEFILTER.prototype.stop = function() {
    this.started = false;
};

// Now we export the module
module.exports = PICTUREFRAMEFILTER;
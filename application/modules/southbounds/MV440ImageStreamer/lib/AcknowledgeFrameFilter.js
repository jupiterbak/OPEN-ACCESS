// constructor function for the Cat class
var frameType = require('./Frame');

function ACKFRAMEFILTER() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.started = false;
}

ACKFRAMEFILTER.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

ACKFRAMEFILTER.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

ACKFRAMEFILTER.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

ACKFRAMEFILTER.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

ACKFRAMEFILTER.prototype.transmit = function (frame, socket) {
    if (!this.started) return;
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(frame, socket);
    }
};

ACKFRAMEFILTER.prototype.handleReceived = function (frame, socket) {
    if (!this.started) return;
    var self = this;
    if (!frame) return;
    if (!frame.isValid()) return;

    if (frame.header.Flags & frameType.ACKNOWLEDGEFLAG === frameType.ACKNOWLEDGEFLAG) {
        //self.transmit(new frameType(frameType.FRAMEHEADERID, frame.header.Seq, frame.header.Version, frameType.ACKNOWLEDGEFLAG + frameType.FINISHEDFLAG, frame.header.Type, Buffer.alloc(0)), socket);
        console.log("ACK Frame");
    }
    if (this.getUpperLayer()) {
        this.getUpperLayer().handleReceived(frame, socket);
    }
};

ACKFRAMEFILTER.prototype.start = function () {
    this.started = true;
};

ACKFRAMEFILTER.prototype.stop = function () {
    this.started = false;
};

// Now we export the module
module.exports = ACKFRAMEFILTER;
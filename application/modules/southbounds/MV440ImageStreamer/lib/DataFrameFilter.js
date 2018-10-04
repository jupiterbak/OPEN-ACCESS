// constructor function for the Cat class
var frameType = require('./Frame');


function DATAFRAMEFILTER() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.started = false;
}

DATAFRAMEFILTER.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

DATAFRAMEFILTER.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

DATAFRAMEFILTER.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

DATAFRAMEFILTER.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

DATAFRAMEFILTER.prototype.transmit = function (frame, socket) {
    if(!this.started) return;
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(frame, socket);
    }
};

DATAFRAMEFILTER.prototype.handleReceived = function (frame, socket) {
    if(!this.started) return;
    var self = this;
    if (!frame) return;
    if (!frame.isValid()) return;

    if ((frame.header.Type >= frameType.DATAFRAMETYPELOW) && (frame.header.Type <= frameType.DATAFRAMETYPEHIGH)) {
        self.transmit(new frameType(frameType.FRAMEHEADERID, frame.header.Seq, frame.header.Version, frameType.ACKNOWLEDGEFLAG + frameType.FINISHEDFLAG, frame.header.Type, Buffer.alloc(0)), socket);
    }
    if (this.getUpperLayer()) {
        this.getUpperLayer().handleReceived(frame, socket);
    }
};

DATAFRAMEFILTER.prototype.start = function() {
    this.started = true;
};

DATAFRAMEFILTER.prototype.stop = function() {
    this.started = false;
};

// Now we export the module
module.exports = DATAFRAMEFILTER;
// constructor function for the Cat class
var frameType = require('./Frame');

function ERRORFRAMEFILTER() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.started = false;
}

ERRORFRAMEFILTER.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

ERRORFRAMEFILTER.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

ERRORFRAMEFILTER.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

ERRORFRAMEFILTER.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

ERRORFRAMEFILTER.prototype.transmit = function (frame, socket) {
    if(!this.started) return;
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(frame, socket);
    }
};

ERRORFRAMEFILTER.prototype.handleReceived = function (frame, socket) {
    if(!this.started) return;
    var self = this;
    if (!frame) return;
    if (!frame.isValid()) return;

    if ((frame.header.Flags & frameType.ERRORFLAG) === frameType.ERRORFLAG) {
        self.transmit(new frameType(frameType.FRAMEHEADERID, frame.header.Seq, frame.header.Version, frameType.ACKNOWLEDGEFLAG + frameType.FINISHEDFLAG, frame.header.Type, Buffer.alloc(0)), socket);
    } 
    if (this.getUpperLayer()) {
        this.getUpperLayer().handleReceived(frame, socket);
    }    
};

ERRORFRAMEFILTER.prototype.start = function() {
    this.started = true;
};

ERRORFRAMEFILTER.prototype.stop = function() {
    this.started = false;
};

// Now we export the module
module.exports = ERRORFRAMEFILTER;
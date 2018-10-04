// constructor function for the Cat class
var frameType = require('./Frame');

function IDLEFRAMEFILTER() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.started = false;

    this.current_seq = 0;
}

IDLEFRAMEFILTER.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

IDLEFRAMEFILTER.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

IDLEFRAMEFILTER.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

IDLEFRAMEFILTER.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

IDLEFRAMEFILTER.prototype.transmit = function (frame, socket) {
    if(!this.started) return;
    // Update frame sequence
    frame.header.Seq = this.current_seq++;
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(frame, socket);
    }
};

IDLEFRAMEFILTER.prototype.handleReceived = function (frame, socket) {
    if(!this.started) return;
    var self = this;
    if (!frame) return;
    if (!frame.isValid()) return;

    this.current_seq = frame.header.Seq;
    if (frame.header.Type === frameType.IDLEFRAMETYPE) {
        self.transmit(new frameType(frameType.FRAMEHEADERID, frame.header.Seq, frame.header.Version, frameType.ACKNOWLEDGEFLAG + frameType.FINISHEDFLAG, frame.header.Type, Buffer.alloc(0)), socket);
    } 
    
    if (this.getUpperLayer()) {
        this.getUpperLayer().handleReceived(frame, socket);
    }

};

IDLEFRAMEFILTER.prototype.start = function() {
    this.started = true;
};

IDLEFRAMEFILTER.prototype.stop = function() {
    this.started = false;
};

// Now we export the module
module.exports = IDLEFRAMEFILTER;
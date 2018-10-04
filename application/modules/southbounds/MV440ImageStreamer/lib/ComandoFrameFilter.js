// constructor function for the Cat class
var frameType = require('./Frame');

function COMANDOFRAMEFILTER() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.started = false;
}

COMANDOFRAMEFILTER.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

COMANDOFRAMEFILTER.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

COMANDOFRAMEFILTER.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

COMANDOFRAMEFILTER.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

COMANDOFRAMEFILTER.prototype.transmit = function (frame, socket) {
    if(!this.started) return;
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(frame, socket);
    }
};

COMANDOFRAMEFILTER.prototype.handleReceived = function (frame, socket) {
    if(!this.started) return;
    var self = this;
    if (!frame) return;
    if (!frame.isValid()) return;

    if ((frame.header.Type >= frameType.CMDFRAMETYPELOW) && (frame.header.Type <= frameType.CMDFRAMETYPEHIGH)) {
        self.transmit(new frameType(frameType.FRAMEHEADERID, frame.header.Seq, frame.header.Version, frameType.ACKNOWLEDGEFLAG + frameType.FINISHEDFLAG, frame.header.Type, Buffer.alloc(0)), socket);
    } 
    if (this.getUpperLayer()) {
        this.getUpperLayer().handleReceived(frame, socket);
    }

};

COMANDOFRAMEFILTER.prototype.start = function() {
    this.started = true;
};

COMANDOFRAMEFILTER.prototype.stop = function() {
    this.started = false;
};

// Now we export the module
module.exports = COMANDOFRAMEFILTER;
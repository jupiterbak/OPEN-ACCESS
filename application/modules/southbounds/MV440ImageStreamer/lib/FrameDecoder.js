// constructor function for the Cat class
var frameType = require('./Frame');

function FrameDecoder() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.started = false;
}

FrameDecoder.prototype.setUpperLayer = function(upper_layer) {
    this.upper_layer = upper_layer;
};

FrameDecoder.prototype.getUpperLayer = function() {
    return this.upper_layer;
};

FrameDecoder.prototype.setLowerLayer = function(lower_layer) {
    this.lower_layer = lower_layer;
};

FrameDecoder.prototype.getLowerLayer = function() {
    return this.lower_layer;
};

FrameDecoder.prototype.transmit = function(frame,socket) {
    if(!this.started) return;
    var buffer = frameType.encode(frame);
    if(buffer){
        if(this.getLowerLayer()){
            this.getLowerLayer().transmit(buffer,socket);
        }
    } 
};

FrameDecoder.prototype.handleReceived = function(buffer,socket) {
    if(!this.started) return;
    var frame = frameType.decode(buffer);
    if(frame){
        if(this.getUpperLayer()){
            this.getUpperLayer().handleReceived(frame,socket);
        }
    }    
};

FrameDecoder.prototype.start = function() {
    this.started = true;
};

FrameDecoder.prototype.stop = function() {
    this.started = false;
};

// Now we export the module
module.exports = FrameDecoder;
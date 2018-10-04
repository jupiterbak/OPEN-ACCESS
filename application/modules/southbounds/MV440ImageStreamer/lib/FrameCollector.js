// constructor function for the Cat class
function FrameCollector() {
    var self = this || {};
    this.upper_layer = null;
    this.lower_layer = null;
    this.buffer_collector = Buffer.alloc(0);
    this.started = false;
}

FrameCollector.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

FrameCollector.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

FrameCollector.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

FrameCollector.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

FrameCollector.prototype.transmit = function (buffer, socket) {
    if (!this.started) return;
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(buffer, socket);
    }
};

FrameCollector.prototype.handleReceived = function (buffer, socket) {
    if (!this.started) return;
    var self = this;

    // This part is not needed anymore since the collection of 
    // the byte is pipelined in TCPPHY layer
    /*
    
    this.buffer_collector = Buffer.concat([this.buffer_collector, buffer]);

    // new incoming frame
    if (this.buffer_collector.length >= 16) {
        console.log("Buffer length:" + this.buffer_collector.length);
        _bufferHeader = Buffer.alloc(16);
        this.buffer_collector.copy(_bufferHeader, 0, 0, 15);
        var header = frameType.decodeHeader(_bufferHeader);
        if (header) {
            console.log("Data Size:" + header.DataSize);
            if (this.buffer_collector.length >= header.DataSize + 16) {
                var sliced_buffer = this.buffer_collector.slice(0, header.DataSize + 16);
                if (self.getUpperLayer()) {
                    self.getUpperLayer().handleReceived(sliced_buffer, socket);
                }

                var rest = Buffer.alloc(this.buffer_collector.length - (header.DataSize + 16));
                this.buffer_collector.copy(rest, 0, header.DataSize + 16, this.buffer_collector.length);
                this.buffer_collector = rest;
            }
        }
    } else {
        this.buffer_collector = Buffer.alloc(0);
    }
    */
    if (self.getUpperLayer()) {
        self.getUpperLayer().handleReceived(buffer, socket);
    }
};

FrameCollector.prototype.start = function () {
    this.started = true;
};

FrameCollector.prototype.stop = function () {
    this.started = false;
};

// Now we export the module
module.exports = FrameCollector;
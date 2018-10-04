// constructor function for the Cat class
const net = require('net');
const IdGenerator = require('shortid');
var frameType = require('./Frame');
const { Transform } = require('stream');

var TCPPHY = function (port, host) {

    this.upper_layer = null;
    this.lower_layer = null;
    this.port = port;
    this.host = host;
    this.buffer_collector = Buffer.alloc(0);
    var self = this;
    this.bufferSplitter = new Transform({
        readableObjectMode: true,
        transform(chunk, encoding, callback) {
            if (self.buffer_collector) {
                self.buffer_collector = Buffer.concat([self.buffer_collector, chunk]);
            } else {
                self.buffer_collector = Buffer.from(chunk);
            }
            if (self.buffer_collector.length >= 16) {
                var _bufferHeader = Buffer.alloc(16);
                self.buffer_collector.copy(_bufferHeader, 0, 0, 15);
                var header = frameType.decodeHeader(_bufferHeader);
                if (header) {
                    if (self.buffer_collector.length >= header.DataSize + 16) {
                        var sliced_buffer = self.buffer_collector.slice(0, header.DataSize + 16);
                        var rest = Buffer.alloc(self.buffer_collector.length - (header.DataSize + 16));
                        self.buffer_collector.copy(rest, 0, header.DataSize + 16, self.buffer_collector.length);
                        self.buffer_collector = rest;
                        this.push([sliced_buffer]);
                    }
                }
            }
            callback();
        }
    });

    this.server = net.createServer(
        function (socket) {
            socket.id = IdGenerator.generate();
            socket.pipe(self.bufferSplitter)
            .on('data', function (data) {
                if(self.started){
                    self.handleReceived(data, socket);
                }                
            });
        }
    );

    this.server.on('error', (err) => {
        throw err;
    });

    this.started = false;
}

TCPPHY.prototype.start = function () {
    var self = this;
    self.server.listen(self.port, self.host, function () {
        console.log("Server listening on port: " + self.port);
    });
    this.started = true;
};

TCPPHY.prototype.stop = function () {
    this.server.close();
    this.started = false;
};

TCPPHY.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

TCPPHY.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

TCPPHY.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

TCPPHY.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

TCPPHY.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

TCPPHY.prototype.transmit = function (buffer, socket) {
    socket.write(buffer);
};

TCPPHY.prototype.handleReceived = function (buffers, socket) {
    if (this.getUpperLayer()) {
        this.getUpperLayer().handleReceived(buffers[0], socket);
    }
};

// Now we export the module
module.exports = TCPPHY;
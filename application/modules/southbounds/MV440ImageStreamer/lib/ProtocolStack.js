function ProtocolStack() {
    this.upper_layer = null;
    this.upper_layer = null;
    this.layers = [];
    this.started = false;
    this.onNewImage = null;
}

ProtocolStack.prototype.setUpperLayer = function (upper_layer) {
    this.upper_layer = upper_layer;
};

ProtocolStack.prototype.getUpperLayer = function () {
    return this.upper_layer;
};

ProtocolStack.prototype.setLowerLayer = function (lower_layer) {
    this.lower_layer = lower_layer;
};

ProtocolStack.prototype.getLowerLayer = function () {
    return this.lower_layer;
};

ProtocolStack.prototype.transmit = function (frame, socket) {
    if (this.getLowerLayer()) {
        this.getLowerLayer().transmit(frame, socket);
    }
};

ProtocolStack.prototype.handleReceived = function (frame, socket) {
    if(this.onNewImage){
        this.onNewImage(frame,socket);
    }
};

ProtocolStack.prototype.addLayer = function (layer) {
    this.layers.push(layer);
};

ProtocolStack.prototype.removeLayer = function (layer) {
    for( var i = 0; i < this.layers.length-1; i++){ 
        if ( this.layers[i] === layer) {
            this.layers.splice(i, 1); 
        }
     }
};

ProtocolStack.prototype.start = function (callback) {
    var lastLayer = null;
    for( var i = 0; i < this.layers.length-1; i++){ 
        var layer = this.layers[i];
        layer.setLowerLayer(lastLayer);
        if(lastLayer!== null){
            lastLayer.setUpperLayer(layer);
        }
        lastLayer = layer;
    }
    this.setLowerLayer(lastLayer);
    lastLayer.setUpperLayer(this);

    for( var i = this.layers.length-1; i >= 0 ; i--){ 
        this.layers[i].start();
    }
    this.started = true;
    this.onNewImage = callback;
};

ProtocolStack.prototype.stop = function (callback) {
    for( var i = 0; i < this.layers.length-1; i++){ 
        this.layers[i].stop();
    }
    this.started = false;
    if(callback){
        callback();
    }
};

module.exports = ProtocolStack;
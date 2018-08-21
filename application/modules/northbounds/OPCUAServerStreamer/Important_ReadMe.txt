Node-opc ua has somes Bugss.

please follow theses instructions:
1. In all your .xml documents search & replace the >"> with the &gt;">
2. go to node_modules\node-opcua\lib\address_space\Address_space.js and the lines to the function _findInBrowseNameIndex

AddressSpace.prototype._findInBrowseNameIndex = function(CLASS,index,browseNameOrNodeId,namespace) {

    if (browseNameOrNodeId instanceof NodeId) {
        assert(namespace === undefined);
        var nodeId = browseNameOrNodeId;
        var obj = this.findNode(nodeId);
        assert(!obj || obj instanceof CLASS);
        return obj;
    }
    assert(!namespace || namespace >=0);
    var browseName  = browseNameOrNodeId;
    if (namespace) {
        browseName = namespace.toString() + ":" + browseName;
    }
	// Line to Add -------------------------------------------
	else {
        if(!index[browseName]){
            var key;
            for (key in index) {
                var val = key.substring(key.indexOf(":")+1);
                if ( val === browseName) {
                    browseName = key;
                    break;
                }
            }
        }
    }
	// Line to Add -------------------------------------------
    return index[browseName];
};
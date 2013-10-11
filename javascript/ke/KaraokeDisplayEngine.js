function KaraokeDisplayEngine(containerID, numLines){
    
    var element = document.getElementById(containerID);
    
    if(!element) {
        throw new Exception('#' + containerID + ' not found.');
    }
    
    this._container = jQuery(element);
    
    this._displays = [];
    
    for(var i = 0; i < numLines; i++) {
        this._displays[i] = new KaraokeDisplay(this, this._container, i);
    }
};

KaraokeDisplayEngine.prototype.getDisplay = function(displayIndex) {
    return this._displays[displayIndex];
};
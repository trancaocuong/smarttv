var Audio = {
    plugin : null
};

Audio.init = function() {
    var success = true;
    
    this.plugin = document.getElementById("pluginAudio"); 
    
    if (!this.plugin) {
        success = false;
    }
    
    return success;
};

Audio.setRelativeVolume = function(delta) {
    this.plugin.SetVolumeWithKey(delta);
};

Audio.getVolume = function() {
    return this.plugin.GetVolume();
};

Audio.setUserMute = function(delta) {	
	this.plugin.SetUserMute(delta);
};

Audio.getUserMute = function() {	
	return this.plugin.GetUserMute();
};



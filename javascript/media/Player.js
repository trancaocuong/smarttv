var Player = {
    plugin : null,
    state : -1,
    skipState : -1,
    completeCallback : null,    /* Callback function to be set by client */
    originalSource : null,
    
    isPlay: false,
    
    STOPPED : 0,
    PLAYING : 1,
    PAUSED : 2,  
    FORWARD : 3,
    REWIND : 4
};

Player.init = function() {
    var success = true;
    this.state = this.STOPPED;
    
    this.plugin = document.getElementById("pluginPlayer");
    
    if (!this.plugin) {
        success = false;
    }
    
    this.plugin.SetDisplayArea(0, 0, 1, 1);
    
    //this.plugin.OnCurrentPlayTime = Player.setCurTime;
    //this.plugin.OnStreamInfoReady = Player.setTotalTime;
    //this.plugin.OnBufferingStart = Player.onBufferingStart;
    //this.plugin.OnBufferingProgress = Player.onBufferingProgress;
    //this.plugin.OnBufferingComplete = Player.onBufferingComplete;     
    
    this.plugin.OnNetworkDisconnected = 'Player.NetworkDisconnected';    
    this.plugin.OnConnectionFailed = 'Player.ConnectionFailed';
    this.plugin.OnStreamNotFound = 'Player.StreamNotFound';
    this.plugin.OnRenderingComplete = 'Player.OnRenderingComplete';     
    
    return success;
};

Player.deinit = function() {
      if (this.plugin) {
            this.plugin.Stop();
      }
};

Player.setVideoURL = function(url) {
    this.url = url;
};

Player.playVideo = function() {
	if (this.url != null) {
        this.state = this.PLAYING;
        
        this.plugin.Stop();
        this.plugin.Resume();
		this.plugin.Play(this.url) ;
		
		this.isPlay = true;
    }
};

Player.pauseVideo = function() {
    this.state = this.PAUSED;
    this.plugin.Pause();
};

Player.stopVideo = function() {
    if (this.state != this.STOPPED)  {
        this.state = this.STOPPED;
        this.plugin.Stop();        
    }
};

Player.resumeVideo = function() {
    this.state = this.PLAYING;
    this.plugin.Resume();
};

Player.skipForwardVideo = function() {
    this.skipState = this.FORWARD;
    this.plugin.JumpForward(5);    
};

Player.skipBackwardVideo = function() {
    this.skipState = this.REWIND;
    this.plugin.JumpBackward(5);
};

Player.getState = function() {
    return this.state;
};

// Global functions called directly by the player 
Player.onBufferingStart = function() {
    
};

Player.onBufferingProgress = function(percent) {
    
};

Player.onBufferingComplete = function() {
    
};

Player.setCurTime = function(time) {
  
};

Player.setTotalTime = function() {
  
};

Player.OnRenderingComplete = function() {
	if (this.completeCallback) {
		this.completeCallback();
    }
	this.isPlay = false;
};

Player.NetworkDisconnected = function() {
	this.isPlay = false;
};


Player.ConnectionFailed = function() {
	this.isPlay = false;
};

Player.StreamNotFound = function() {
	this.isPlay = false;
};


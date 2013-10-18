var Player = {
    plugin : null,
    state : -1,
    skipState : -1,
    progressCallback : null,    /* Callback function to be set by client */
    completeCallback : null,    /* Callback function to be set by client */
    originalSource : null,
    
    dispatchBuffer: false,
    bufferCallback: null,
    
    isPlay: false,
    
    STOPPED : 0,
    PLAYING : 1,
    PAUSED : 2,  
    FORWARD : 3,
    REWIND : 4
};

Player.init = function(playerID) {
    var success = true;
    this.state = this.STOPPED;
    
    this.plugin = document.getElementById(playerID);
    
    if (!this.plugin) {
        success = false;
    }
    
    this.plugin.SetDisplayArea(0, 0, 1, 1);
    
    //this.plugin.OnCurrentPlayTime = Player.setCurTime;
    //this.plugin.OnStreamInfoReady = Player.setTotalTime;
    this.plugin.OnBufferingStart = 'Player.onBufferingStart';
    this.plugin.OnBufferingProgress = 'Player.onBufferingProgress';
    this.plugin.OnBufferingComplete = 'Player.onBufferingComplete';     
    
    this.plugin.OnNetworkDisconnected = 'Player.NetworkDisconnected';    
    this.plugin.OnConnectionFailed = 'Player.ConnectionFailed';
    this.plugin.OnStreamNotFound = 'Player.StreamNotFound';
    this.plugin.OnRenderingComplete = 'Player.OnRenderingComplete';     
    
    this.plugin.OnCurrentPlayTime = 'Player.OnCurrentPlayTime';
    
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

Player.resumeVideo = function() {
    this.state = this.PLAYING;
    this.plugin.Resume();
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
	//alert('start buffering...');
};

Player.onBufferingProgress = function(percent) {
	//alert('...buffering...');
};

Player.onBufferingComplete = function() {
	//alert('complete buffering...');
	
	if (this.dispatchBuffer == false) {
		this.dispatchBuffer = true;
		this.bufferCallback();
	}
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

Player.OnCurrentPlayTime = function(time) {	
	if (this.progressCallback) {
		this.progressCallback(time);
    }
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


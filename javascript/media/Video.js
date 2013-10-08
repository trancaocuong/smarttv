var Video = {
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

Video.init = function(videoID) {
    var success = true;
    this.state = this.STOPPED;
    
    this.plugin = document.getElementById(videoID);
    
    if (!this.plugin) {
        success = false;
    }
    
    this.plugin.SetDisplayArea(0, 0, 960, 540);
    
    //this.plugin.OnCurrentPlayTime = Video.setCurTime;
    //this.plugin.OnStreamInfoReady = Video.setTotalTime;
    //this.plugin.OnBufferingStart = Video.onBufferingStart;
    //this.plugin.OnBufferingProgress = Video.onBufferingProgress;
    //this.plugin.OnBufferingComplete = Video.onBufferingComplete;     
    
    this.plugin.OnNetworkDisconnected = 'Video.NetworkDisconnected';    
    this.plugin.OnConnectionFailed = 'Video.ConnectionFailed';
    this.plugin.OnStreamNotFound = 'Video.StreamNotFound';
    this.plugin.OnRenderingComplete = 'Video.OnRenderingComplete';     
    
    return success;
};

Video.deinit = function() {
      if (this.plugin) {
            this.plugin.Stop();
      }
};

Video.setVideoURL = function(url) {
    this.url = url;
};

Video.playVideo = function() {
	if (this.url != null) {
        this.state = this.PLAYING;
        
        this.plugin.Stop();
        this.plugin.Resume();
		this.plugin.Play(this.url) ;
		
		this.isPlay = true;
    }
};

Video.pauseVideo = function() {
    this.state = this.PAUSED;
    this.plugin.Pause();
};

Video.stopVideo = function() {
    if (this.state != this.STOPPED)  {
        this.state = this.STOPPED;
        this.plugin.Stop();        
    }
};

Video.resumeVideo = function() {
    this.state = this.PLAYING;
    this.plugin.Resume();
};

Video.skipForwardVideo = function() {
    this.skipState = this.FORWARD;
    this.plugin.JumpForward(5);    
};

Video.skipBackwardVideo = function() {
    this.skipState = this.REWIND;
    this.plugin.JumpBackward(5);
};

Video.getState = function() {
    return this.state;
};

// Global functions called directly by the Video 
Video.onBufferingStart = function() {
    
};

Video.onBufferingProgress = function(percent) {
    
};

Video.onBufferingComplete = function() {
    
};

Video.setCurTime = function(time) {
  
};

Video.setTotalTime = function() {
  
};

Video.OnRenderingComplete = function() {
	if (this.completeCallback) {
		this.completeCallback();
    }
	this.isPlay = false;
};

Video.NetworkDisconnected = function() {
	this.isPlay = false;
};


Video.ConnectionFailed = function() {
	this.isPlay = false;
};

Video.StreamNotFound = function() {
	this.isPlay = false;
};


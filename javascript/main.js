var widgetAPI 	= new Common.API.Widget();
var pluginAPI 	= new Common.API.Plugin();
var tvKey 		= new Common.API.TVKeyValue();

var Main = {};
var dataProvider = new LyricsDataProvider();
var karaoke;

Main.onUnload = function() {	
	if (Player) {
		Player.deinit();
	}	
};

Main.onLoad = function() {
	
	try {
		//The GetFirmware function returns a string in the form ‘T-INFOLINKxxxx-yyyyy’, where xxxx is the device release year and yyyy the current Infolink version.
		//var pluginObjectNNavi = document.getElementById("pluginObjectNNavi");
		
	} catch (e) {} 	
	
	//auto loop sound
	if (Video.init('pluginVideo') && Player.init('pluginPlayer') && Audio.init()) {
		Player.completeCallback = Main.onCompletePlayAudioHandler;
		Player.progressCallback = Main.onPlayingAudioHandler;
		Player.bufferCallback = Main.onBufferCompleteHandler;
		
		Video.completeCallback = Main.onCompletePlayVideoHandler;
	}	
	
	document.getElementById("anchor").focus();
	
	try{
		window.onshow = onShowEvent;	
		window.onShow = onShowEvent;
	} catch (err) {}
	 
	// Set Default key handler function
	widgetAPI.sendReadyEvent();	
	
	//pluginAPI.registKey(tvKey.KEY_EXIT);
	//pluginAPI.unregistKey(246);

	Main.networkPlugin = document.getElementById('pluginObjectNetwork');	
	setInterval(cyclicInternetConnectionCheck, 15000);
	
	//setOffScreenSaver
	setOffScreenSaver();	
	setInterval(setOffScreenSaver, 10 * 60 * 1000);			
	
	loadLyrics();
};	
	
function loadLyrics() {
 	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetConfigHandler);	
 	ldr.load('test/lyrics.txt', "");	
};
	 	
function onGetConfigHandler(responseText) {
	//alert(responseText);
	
	var lines = responseText.split("\r\n");
	
	//to make sure no empty line
	var count = 0;
	while(count < lines.length) {
		if ($.trim(lines[count]) == '') {
			lines.splice(count, 1);
		} else{
			count ++;
		}
	}

	//add line to data provider
	var len = lines.length;
	for (var i = 0; i < len; i ++) {
		if ($.trim(lines[i]) != '') {
			dataProvider.addLineData(lines[i], (i == (len - 1)) ? true : false);
		}	
	}
    
    Main.initKaraoke();	
    Main.onCompletePlayAudioHandler();
    Main.onCompletePlayVideoHandler();
};

Main.onBufferCompleteHandler = function() {
	Main.startLyrics();
};

function startAudioAndVideo() {
        
}

function setOffScreenSaver() {
	pluginAPI.setOffScreenSaver();
};

onShowEvent = function() {
	var NNaviPlugin = document.getElementById("pluginObjectNNavi");
	NNaviPlugin.SetBannerState(1);
    
	//pluginAPI.registKey(tvKey.KEY_INFOLINK);
	//pluginAPI.registKey(tvKey.KEY_INFO);
	//pluginAPI.registKey(tvKey.KEY_SEARCH);
	//pluginAPI.registKey(tvKey.KEY_CHLIST);
	//pluginAPI.registKey(tvKey.KEY_SOCIAL);
	//pluginAPI.registKey(tvKey.KEY_CC);
	//pluginAPI.registKey(tvKey.KEY_CONTENT);
	//pluginAPI.registKey(tvKey.KEY_FAVCH);
	//pluginAPI.registKey(tvKey.KEY_EMODE);
	//pluginAPI.registKey(tvKey.KEY_DMA);
	//pluginAPI.registKey(tvKey.KEY_3D);
	
	// For Exit key	
	pluginAPI.registKey(tvKey.KEY_EXIT);
    
	// For volume OSD	
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	
	//pluginAPI.registIMEKey();
};

cyclicInternetConnectionCheck = function() {
	//count ++;
	var isNet = checkConnection();
	
	//var divDebug = document.getElementById("divDebug");
	//divDebug.innerHTML = 'Count ' + count + ' = ' + isNet;
	
	if (isNet == false) {
		var CP = Main.curPage;
		Main.changePage(ViewType.NETWORK, CP);
	} else {		
		if (Player && Player.isPlay == false) {
			Player.playVideo();
		}
	}	
};

checkConnection = function() {

	var physicalConnection = 0,
	httpStatus = 0;

	// Get active connection type - wired or wireless.
	currentInterface = Main.networkPlugin.GetActiveType();

	// If no active connection.
	if (currentInterface == -1) {
		return false;
	}

	// Check physical connection of current interface.
	physicalConnection = Main.networkPlugin.CheckPhysicalConnection(currentInterface);

	// If not connected or error.
	if (physicalConnection != 1) {
		return false;
	}

	// Check HTTP transport.
	httpStatus = Main.networkPlugin.CheckHTTP(currentInterface);

	// If HTTP is not avaliable.
	if (httpStatus != 1) {
		return false;
	}

	// Everything went OK.
	return true;
};

Main.getMp3Path = function(nameFile) {
	var path = location.href;
	
	var substringIndex = path.indexOf("index.html", 0);
	if (substringIndex > 0) {
		path = path.substring(0, substringIndex);
	}
	path += nameFile;
	path = path.replace(/%20/g, " ");
	return path;
};

Main.onCompletePlayAudioHandler = function() {	
	var url = 'http://vio.akadigital.vn/MP3.mp3';	
	Player.setVideoURL(url);
	Player.playVideo();
};

Main.onCompletePlayVideoHandler = function() {	
	//var url = 'http://vio.akadigital.vn/MP4.mp4';
	//var url = 'http://kchat.akadigital.vn:90/karaoke1.mp4';
	//Video.setVideoURL(url);
	//Video.playVideo();
};

Main.onKeyHandler = function(event) {

	var keyCode = event.keyCode;
	//alert(keyCode);
	
	if (keyCode == TVKey.KEY_EXIT || keyCode == TVKey.KEY_RETURN) {
        widgetAPI.blockNavigation(event);        
    }
	
	else {
		
		if (keyCode == TVKey.KEY_1) {
			
		}
		
		else if (keyCode == TVKey.KEY_RED) {
				
		}
		
		else if (keyCode == TVKey.KEY_GREEN) {
				
		}
		
		else if (keyCode == TVKey.KEY_YELLOW) {
						
		}
		
		else if (keyCode == TVKey.KEY_BLUE) {
						
		}
		
		else if (keyCode == TVKey.KEY_TOOL) {
						
		}
		
		else if (keyCode == TVKey.KEY_INFO) {
						
		}
		
		else if (keyCode == TVKey.KEY_RETURN) {
						
		}
		
		else if (keyCode == TVKey.KEY_EXIT) {
						
		}
	}
};


Main.exitApp = function() {
	widgetAPI.sendExitEvent();
};

Main.returnApp = function() {
	widgetAPI.sendReturnEvent();
};

Main.initKaraoke = function() {
	var timings = dataProvider.toArray();

	karaoke = new Karaoke(timings);
	karaoke.init('karaoke-display', 2);
};

Main.onPlayingAudioHandler = function(time) {
	//show.render(time / 1000);
};


Main.startLyrics = function() {
	
	var count = 0;
    var delay = 50;
    //var lastPosition = 0;
    
    setInterval(function() {
        //if (this.position < lastPosition) {
        //    show.reset();
        //}
        
        karaoke.render(count * delay / 1000);
        //lastPosition = count * delay;
        
        //alert(count * delay / 1000);
        
        count ++;
    }, delay);	
};

var tvKey = new Common.API.TVKeyValue();
var widgetAPI = new Common.API.Widget();
var pluginAPI = new Common.API.Plugin();

var Main = {
};

//TV screen data
var TV = {
	LEFT: 9,
	TOP : 98,
	WIDTH : 612,
	HEIGHT : 386
};
  
//model
var vol;
var userMute;
var RefeshData = 500;
var RefeshTimeout;
var ReloadMessage = 5000;
var ReloadMessageTimout;
var modelCode;
var arrFricker = [];
var SecondFricker = 3;
var timeoutID;
var arrRoom = [];

showHandler = function() {
	var NNaviPlugin = document.getElementById("pluginObjectNNavi");
	pluginAPI.SetBannerState(1);
	NNaviPlugin.SetBannerState(1);
	
    pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
};

Main.onLoad = function() {
	// Enable key event processing
	this.enableKeys();
	
	window.onshow = showHandler;
	window.onShow = showHandler;
	
	//Player and sound
	//Player.init();
	//Audio.init();
	//userMute = Audio.getUserMute();
	
	widgetAPI.sendReadyEvent();
	
	// For volume OSD	
	pluginAPI.unregistKey(tvKey.KEY_CH_UP);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_CH_UP);
	
	pluginAPI.unregistKey(tvKey.KEY_CH_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_CH_DOWN);
	
	var networkPlugin = document.getElementById('pluginObjectNetwork');
    var nnaviPlugin = document.getElementById('pluginObjectNNavi');
    modelCode = nnaviPlugin.GetDUID(networkPlugin.GetHWaddr()) + Math.floor(Math.random() * 1000000) / 100000;
    
    //set tv signal area
	try {
		deviceapis.tv.window.setRect(new SRect(TV.LEFT, TV.TOP, TV.WIDTH, TV.HEIGHT));
		deviceapis.tv.window.show(0);
	
		//open current channel
		var channel = webapis.tv.channel.getCurrentChannel();
		webapis.tv.channel.tune({ ptc: channel.ptc}, onTuneSuccess, onError, 0);
	
		//webapis.tv.channel.tuneDown(onTuneSuccess, onError, 0);
	
	} catch (err) { }
	
	for (var i = 0; i < 6; i ++) {
        arrFricker.push({count: 0, id: (i + 1), fricker :false});
    }
	
	loadRoom();
};

Main.onUnload = function() {
};

Main.enableKeys = function() {
	document.getElementById("anchor").focus();
};

Main.keyDown = function() {
	var keyCode = event.keyCode;
	
	switch(keyCode)
	{
		 case tvKey.KEY_VOL_UP:
	     case tvKey.KEY_PANEL_VOL_UP:
	    	 volumnUp();
			break;
			
	     case tvKey.KEY_VOL_DOWN:
	     case tvKey.KEY_PANEL_VOL_DOWN:
	    	 volumnDown();
			break;
			
	     case tvKey.KEY_MUTE:
	        volumnMute();
	        break;	
			
		case tvKey.KEY_CH_UP:
		case tvKey.KEY_PANEL_CH_UP:			
			deviceapis.tv.channel.tuneUp(onTuneSuccess, onError, 0);
			break;
			
		case tvKey.KEY_CH_DOWN:
		case tvKey.KEY_PANEL_CH_DOWN:			
			deviceapis.tv.channel.tuneUp(onTuneSuccess, onError, 0);
			break;
		default:
			break;
	}
};

function onTuneSuccess() {
};

function onError(err) {
};

function volumnUp() {
	//Audio.setRelativeVolume(0);
}

function volumnDown() {
	//Audio.setRelativeVolume(1);
}

function volumnMute() {
	//userMute = (userMute == 0) ? 1 : 0;
	//Audio.setUserMute(1);
}

function formatNumber(value) {
	var num = parseInt(value);	
	if (num < 10) {
		return '00' + num; 
	}	
	else if (num < 100) {
		return '0' + num;
	}	
	return num;	
}

function loadRoom() {	
	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetRoomHandler);	
 	ldr.load(Config.ROOM_URL, "");	
}

function onGetRoomHandler(responseText) {
	var obj = eval ("(" + responseText + ")");
	
	arrRoom = obj.GetRoomsResult;
	
	loadConfig();
}

function loadConfig() {
 	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetConfigHandler);	
 	ldr.load(Config.CONFIG_URL, "");	
};
 	
function onGetConfigHandler(responseText) {

	var obj = eval ("(" + responseText + ")");
	
	//alert('HANHPHUC HOSPITAL: GetConfig - ' + responseText);
	
 	//ReloadMessage
 	ReloadMessage = parseInt(obj.GetConfigResult.ReloadMessage);
 	ReloadMessageTimout = setTimeout(getMessage, ReloadMessage); 
 	
 	SecondFricker = parseInt(obj.GetConfigResult.SecondFlicker);
 	
 	//get new records
 	RefeshData = parseInt(obj.GetConfigResult.RefreshData);
 	
 	getNewRecords();
 	
 	//show message
	if (message && obj && obj.GetConfigResult && obj.GetConfigResult.Message) {
 		showMessage(obj.GetConfigResult.Message);
 	}
};

function showMessage(msg) {
	
	var  message = document.getElementById('message');
	if (message.innerHTML == msg || msg == '') {
		return;
	}

	clearInterval(timeoutID);
	timeoutID = null;
	
	message.style.left = '940px';
	message.innerHTML = msg;
	
	timeoutID = setInterval(function() {
		var toX = parseInt(message.style.left) - 2;		
		var wid = $('#message').width();	
		
		if (toX < - wid) {
			toX = 940;
		}		
		message.style.left = toX + 'px';		
	}, 20);
}
  
function getMessage() {
 	clearTimeout(ReloadMessageTimout);
 	ReloadMessageTimout = null;
 	
 	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetMessageHandler);	
 	ldr.load(Config.MESSAGE_URL, "");	
};

function onGetMessageHandler(responseText) {
 	var obj = eval ("(" + responseText + ")");
 	
 	//alert('HANHPHUC HOSPITAL: GetMessage - ' + responseText);
 	
 	//show message
 	if (obj.GetMessageResult.message) {
 		showMessage(obj.GetMessageResult.message);
 	} 	
 	
 	ReloadMessageTimout = setTimeout(getMessage, ReloadMessage); 
};

function getNewRecords() {
 	clearTimeout(RefeshTimeout);
 	
 	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetNewRecordsHandler);	
 	ldr.load(Config.RECORDS_URL, "tv_Id=" + modelCode);	
};

function onGetNewRecordsHandler(responseText) {
	//alert('HANHPHUC HOSPITAL: GetNewRecords - ' + responseText);
	
	var obj = eval ("(" + responseText + ")");
 	
 	var TicketNo;
 	var DisplayId;
 	var element;
 	//var fricker;
    var len = obj.GetNewRecordsResult.Records.length;
    var objTicker;
 	
    //reset
    /*
    for (var i = 0; i < 6; i ++) {
        objTicker = arrFricker[i];
        
        clearTimeout(objTicker.timeout);
		objTicker.timeout = null;
        objTicker.count = 0;
        
        fricker = document.getElementById('div0' + objTicker.id);
        fricker.style.display = 'none'; 
        
        element = document.getElementById('p0' + objTicker.id); 		
        element.style.color = '#00adef';
    }
    */
 	
	var tmp = obj.GetNewRecordsResult.Records;
 	for (var i = 0; i < len; i ++) {
 		TicketNo = tmp[i]['TicketNo'];
 		DisplayId = getRoomID(tmp[i]['DisplayId']);
		
		if (DisplayId == '') {
			continue;
		}
 		
 		element = document.getElementById('p' + DisplayId); 		
 		//fricker = document.getElementById('div' + DisplayId);
 		
		//if (fricker) {
		//	fricker.style.display = 'block';
 		//} 
        		
 		if (element) {
 			element.innerHTML = formatNumber(TicketNo);
 			element.style.color = '#00adef';
 			
			objTicker = getTicker(parseInt(DisplayId));
            
			if (objTicker) {
                clearTimeout(objTicker.timeout);
				objTicker.timeout = null;
				objTicker.count = 0;
				objTicker.fricker = false;
		
				doFricker(objTicker);
            } 
 		}	
 	}
 	
 	//if (len > 0) {
	//	alert('HANH PHUC HOSPITAL: Player.isPlay = ' + Player.isPlay);
 	//	if (Player.isPlay == false) {
 	//		playPingPong();
 	//	}	
 	//}
 	
 	RefeshTimeout = setTimeout(getNewRecords, RefeshData);	
};

function getRoomID(id) {
	
	for (var i = 0; i < arrRoom.length; i ++) {
		if (id == arrRoom[i]['ROOM_' + (i + 1)]) {
			return '0' + (i + 1);
		}
	}
	
	return '';
	
	
	/*
	if (id == Config.ROOM_1) {
		return '01';
	}
	
	else if (id == Config.ROOM_2) {
		return '02';
	}
	
	else if (id == Config.ROOM_3) {
		return '03';
	}
	
	else if (id == Config.ROOM_4) {
		return '04';
	}
	
	else if (id == Config.ROOM_5) {
		return '05';
	}
	
	else if (id == Config.ROOM_6) {
		return '06';
	}
	*/
	
	return '';	
}

function getTicker(id) {
    for (var i = 0; i < 6; i ++) {
        if (arrFricker[i].id == id) {
            return arrFricker[i];
        }         
    } 
    return null;
}

function getMp3Path(nameFile) {
	var path = location.href;
	
	var substringIndex = path.indexOf("index.html", 0);
	if (substringIndex > 0) {
		path = path.substring(0, substringIndex);
	}
	
	path += nameFile;
	path = path.replace(/%20/g, " ");
	
	return path;
};

function playPingPong() {	
	//var url = getMp3Path('audio/pinpong.mp3');
	
	//test live link
	//url = 'http://dongdao.akadigital.vn/pinpong.mp3';
	
	//Player.setVideoURL(url);
	//Player.playVideo();	
};

function doFricker(obj) {
		
	//var fricker = document.getElementById('div0' + obj.id);
    var element = document.getElementById('p0' + obj.id);
    
    if (obj.count < SecondFricker * 2) {
		obj.count = obj.count + 1;
		
		if (obj.fricker == false) {
			obj.fricker = true;
			//fricker.style.display = 'block';
			element.style.color = '#FF0000';
		} else {
			obj.fricker = false;
			//fricker.style.display = 'none';
			element.style.color = '#00adef';
		}
	
		obj.timeout = setTimeout(function() {
			clearTimeout(obj.timeout);
			obj.timeout = null;		
			doFricker(obj);		
		}, 330);
	} else {	
		clearTimeout(obj.timeout);
		
		obj.count = 0;		
		obj.timeout = null;
		obj.fricker = false;
		
		//fricker.style.display = 'none';
		element.style.color = '#00adef';
	}
};

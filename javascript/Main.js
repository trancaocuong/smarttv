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

Main.onLoad = function() {
	// Enable key event processing
	this.enableKeys();
	
	 //Player and sound
	Player.init();
	Audio.init();
	
	widgetAPI.sendReadyEvent();
	
	// For volume OSD	
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	
	pluginObjectNNavi = document.getElementById("pluginObjectNNavi");
    pluginObjectNNavi.SetBannerState(1);
    
	modelCode = pluginObjectNNavi.GetModelCode();
	
	//set tv signal area
	try {
		deviceapis.tv.window.setRect(new SRect(TV.LEFT, TV.TOP, TV.WIDTH, TV.HEIGHT));
		deviceapis.tv.window.show(0);
	
		//alert("device source: " + deviceapis.tv.window.getSource().mode + " " + deviceapis.tv.window.getSource().number);
		var channel = webapis.tv.channel.getCurrentChannel();
		
		//open current channel
		webapis.tv.channel.tune({ptc: channel.ptc}, onTuneSuccess, onError, 0);
	
	} catch (err) { }
	
	//webapis.tv.channel.tune({
	//	ptc: 9,
	//	major: 9,
	//	minor: 0
	//	
	//}, onTuneSuccess, onError, 0);

	for (var i = 0; i < 6; i ++) {
        arrFricker.push({count: 0, id: (i + 1)});
    }
	
	loadConfig();
};

Main.onUnload = function()
{
};

Main.enableKeys = function()
{
	document.getElementById("anchor").focus();
};

Main.keyDown = function()
{
	 
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	var buttonName = "Unhandled Key Code";
	
	switch(keyCode)
	{
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			buttonName = "RETURN";
			widgetAPI.sendReturnEvent();
			break;
		case tvKey.KEY_LEFT:
			buttonName = "LEFT";
			break;
		case tvKey.KEY_RIGHT:
			buttonName = "RIGHT";
			break;
		case tvKey.KEY_UP:
			buttonName = "UP";
			deviceapis.tv.channel.tuneUp(onTuneSuccess, onError, 0);
			break;
		case tvKey.KEY_DOWN:
			buttonName = "DOWN";
			deviceapis.tv.channel.tuneUp(onTuneSuccess, onError, 0);
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			buttonName = "ENTER";
			break;
		case tvKey.KEY_CH_UP:
			deviceapis.tv.channel.tuneUp(onTuneSuccess, onError, 0);
			break;
		case tvKey.KEY_CH_DOWN:
			deviceapis.tv.channel.tuneUp(onTuneSuccess, onError, 0);
			break;
		default:
			break;
	}
	
};

function onTuneSuccess()
{
	alert("tune success");
}
var tuneCallback = {
   onsuccess : function() {
      alert("Tune successfully"); },
   onnosignal : function() {
      alert("No Signal"); },
   onresolutionchanged : function() {
      alert("Resoultion changed");}
};

function onError(err)
{
   alert("Error : " + err.message);
};
 
var channel = {
		   ptc : 50
		};
		

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

function loadConfig() {
 	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetConfigHandler);	
 	ldr.load(Config.CONFIG_URL, "");	
};
 	
function onGetConfigHandler(responseText) {

	var obj = eval ("(" + responseText + ")");
	
	//alert('HANHPHUC HOSPITAL: GetConfig - ' + responseText);
	
 	//ReloadMessage
 	ReloadMessage = parseInt(obj.GetConfigResult.ReloadMessage * 1000);
 	ReloadMessageTimout = setTimeout(getMessage, ReloadMessage); 
 	
 	SecondFricker = 3;//parseInt(obj.GetConfigResult.SecondFricker);
 	
 	//get new records
 	RefeshData = 5000;//parseInt(obj.GetConfigResult.RefreshData * 1000);
 	getNewRecords();
 	
 	//show message
 	if (obj.GetConfigResult.Message) {
 		document.getElementById('message').innerHTML = obj.GetConfigResult.Message;
 	}
};
  
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
 		document.getElementById('message').innerHTML = obj.GetMessageResult.message;
 	} 	
 	
 	ReloadMessageTimout = setTimeout(getMessage, ReloadMessage); 
};

function getNewRecords() {
 	clearTimeout(RefeshTimeout);
 	
 	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetNewRecordsHandler);	
 	ldr.load(Config.RECORDS_URL, "tv_Id=" + modelCode);	
	
	//param tv_Id
};

function onGetNewRecordsHandler(responseText) {
	//alert('HANHPHUC HOSPITAL: GetNewRecords - ' + responseText);
	
	var obj = eval ("(" + responseText + ")");
 	
 	var TicketNo;
 	var DisplayId;
 	var element;
 	var fricker;
    var len = obj.GetNewRecordsResult.Records.length;
    var objTicker;
 	
    //reset
    for (var i = 0; i < 6; i ++) {
        objTicker = arrFricker[i];
        
        objTicker.count = 0;
        
        clearTimeout(objTicker.timeout);
		objTicker.timeout = null;
        
        fricker = document.getElementById('div0' + objTicker.id);
        fricker.style.display = 'none'; 
    }
 	
	var tmp = obj.GetNewRecordsResult.Records;
 	for (var i = 0; i < len; i ++) {
 		TicketNo = tmp[i]['TicketNo'];
 		DisplayId = getRoomID(tmp[i]['DisplayId']);
 		
 		element = document.getElementById('p' + DisplayId); 		
 		fricker = document.getElementById('div' + DisplayId);
 		
 		if (element) {
 			element.innerHTML = formatNumber(TicketNo);
 			
 			if (fricker) {
 				fricker.style.display = 'block';
 			} 
            
 			objTicker = getTicker(parseInt(DisplayId));
            if (objTicker) {
                doFricker(objTicker);
            } 
 		}	
 	}
 	
 	if (len > 0) {
 		playPingPong();
 	}
 	
 	RefeshTimeout = setTimeout(getNewRecords, RefeshData);	
};

function getRoomID(id) {
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
	
	return '06';	
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
	var url = getMp3Path('audio/pinpong.mp3');
	
	Player.setVideoURL(url);
	Player.playVideo();	
};

function doFricker(obj) {
		
	if (obj.count < SecondFricker * 2 + 1) {
		obj.count += 1;
        
        var fricker = document.getElementById('div0' + obj.id);
        var element = document.getElementById('p0' + obj.id); 		
        
		if (fricker.style.display == 'none') {
			fricker.style.display = 'block';
			element.style.color = '#97c11f';
		} else {
			fricker.style.display = 'none';
			element.style.color = '#00adef';
		}
	
		obj.timeout = setTimeout(function() {
			clearTimeout(obj.timeout);
			obj.timeout = null;		
			doFricker(obj);		
		}, 1000);
	} else {	
		obj.count = 0;
		clearTimeout(obj.timeout);
		obj.timeout = null;
	}
};

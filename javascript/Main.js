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
	HEIGHT : 398
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
	
	pluginObjectNNavi = document.getElementById("pluginObjectNNavi");
    pluginObjectNNavi.SetBannerState(1);
    
	modelCode = pluginObjectNNavi.GetModelCode();
	
	//set tv signal area
	try {
		deviceapis.tv.window.setRect(new SRect(TV.LEFT, TV.TOP, TV.WIDTH, TV.HEIGHT));
		deviceapis.tv.window.show(0);
	
		//alert("device source: " + deviceapis.tv.window.getSource().mode + " " + deviceapis.tv.window.getSource().number);
		var channel = webapis.tv.channel.getCurrentChannel();
	
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
//get the un-obfuscated code from the js files
//	xhttp=new XMLHttpRequest();
//	 xhttp.open("GET","$MANAGER_WIDGET/Common/API/TVKeyValue.js",false);
//	 xhttp.send("");
//	 xmlDoc=xhttp.responseText;
//	 alert(xmlDoc);
	 
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
		

function loadConfig() {
 	var ldr = new URLLoader();
 	ldr.addEventListener(Event.COMPLETE, onGetConfigHandler);	
 	ldr.load(Config.CONFIG_URL, "");	
};
 	
function onGetConfigHandler(responseText) {
 	var obj = eval ("(" + responseText + ")");
 	
 	//ReloadMessage
 	ReloadMessage = parseInt(obj.ReloadMessage);
 	ReloadMessageTimout = setTimeout(getMessage, ReloadMessage); 
 	
 	SecondFricker = parseInt(obj.SecondFricker);
 	
 	//get new records
 	RefeshData = parseInt(obj.RefreshData);
 	getNewRecords();
 	
 	//show message
 	if (obj.Message) {
 		document.getElementById('message').innerHTML = obj.Message;
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
 	if (obj.message) {
 		document.getElementById('message').innerHTML = obj.message;
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
 	var fricker;
    var len = obj.records.length;
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
 	
 	for (var i = 0; i < len; i ++) {
 		TicketNo = obj.records[i]['TicketNo'];
 		DisplayId = obj.records[i]['DisplayId'];
 		
 		element = document.getElementById('p' + DisplayId); 		
 		fricker = document.getElementById('div' + DisplayId);
 		
 		if (element) {
 			element.innerHTML = TicketNo;
 			
 			if (fricker) {
 				fricker.style.display = 'block';
 			} 
            
            objTicker = getTicker(DisplayId);
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
	//url = 'http://dongdao.akadigital.vn/pinpong.mp3';
	
	Player.setVideoURL(url);
	Player.playVideo();	
};

function doFricker(obj) {
		
	if (obj.count < SecondFricker * 2 + 1) {
		obj.count += 1;
        
        var fricker = document.getElementById('div0' + obj.id);
		if (fricker.style.display == 'none') {
			fricker.style.display = 'block';
		} else {
			fricker.style.display = 'none';
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

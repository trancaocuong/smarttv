/*
function InputIME(inputId, exitId, key, ready) {
	
	this.readyFunction = ready;
	
	this.exitElement = document.getElementById(exitId);
	
	this.keyboard = key ? key : '_latin_small';
    	
	var self = this;
	
	this.ime = new IMEShell(inputId, function() {		
		self.installFocusKeyCallbacks();
		self.installStatusCallbacks();    
		self.initCompleteCallbacks();		
	}, 'vn');
};

InputIME.prototype.installFocusKeyCallbacks = function() {
        
	var self = this;
	
	this.ime.setKeyFunc(tvKey.KEY_ENTER, function(event) { 
		self.exitElement.focus();
		return false; 
	
	} );
	
	this.ime.setKeyFunc(tvKey.KEY_RETURN, function(event) {
		self.exitElement.focus();
		
		widgetAPI.blockNavigation(event);
		//return false;
	} );
	
	this.ime.setKeyFunc(tvKey.KEY_EXIT, function(event) {
		self.exitElement.focus();
		
		widgetAPI.blockNavigation(event);
		//widgetAPI.sendExitEvent();
		//return false;
    } );
};
    
InputIME.prototype.installStatusCallbacks = function() {
        
	this.ime.setKeypadPos(970, 0);
    //ime.setWordBoxPos(18, 6);
	//this.ime.setMode(this.keyboard);
       
    //ime.setAnyKeyFunc(onAnyKey);
    //ime.setMaxLengthFunc(onMaxLength);
    //ime.setPrevEventOnLeftFunc(onLeft);
    //ime.setOnCompleteFunc(onComplete);
    //ime.setEnterFunc(onEnter);
    //ime.setKeyFunc(tvKey.KEY_INFO, onInfoKey);
	
	//_latin_small - small letters: “abcd”, “boy”, “girl”
	//_latin_cap - first letter capital: “Abcd”, “Boy”, “Girl”
	//_latin_big - capital letters: “ABCD”, “BOY”, “GIRL”
	//_num - numeric letters: 1, 2, 3, 4
	//_special - special letters: !, @, #, $
	//ime.setMode('_num');
};
  
InputIME.prototype.initCompleteCallbacks = function() {    	
	this.exitElement.focus();    	
	
	if (this.readyFunction) {
		this.readyFunction();
	}
};
  
InputIME.prototype.dispose = function() {
	this.exitElement.focus();   	
};

InputIME.prototype.setString = function(str) {    	
	this.ime.setString(str);
};

InputIME.prototype.setKeypadPos = function() {    	
	this.ime.setKeypadPos(690, 80);
};
*/

var InputIME  = function(inputId, exitId, key, ready)
{
	pluginAPI.registIMEKey();
	
    var imeReady = function(imeObject)
    {
    	document.getElementById(exitId).focus();	
    	
    	ready();
		
        installStatusCallbacks();
        
		
    }
    
	var ime = new IMEShell(inputId, imeReady, 'vn');
   
	var installStatusCallbacks = function() {
		ime.setKeypadPos(970, 0);
		
		ime.setKeyFunc(tvKey.KEY_ENTER, onEnterKey);
		ime.setKeyFunc(tvKey.KEY_RETURN, onReturnKey);
        ime.setKeyFunc(tvKey.KEY_EXIT, onExitKey);
        
    }    
	
    var onEnterKey = function(keyCode) {
		document.getElementById(inputId).blur();      
		document.getElementById(exitId).focus();
	}
	
	var onReturnKey = function(event) {
		widgetAPI.blockNavigation(event);
		
		ime._blur();
		document.getElementById(inputId).blur();      
		document.getElementById(exitId).focus();		
    }
    
	var onExitKey = function (event){
		widgetAPI.blockNavigation(event);
		
		ime._blur();
		document.getElementById(inputId).blur();      
		document.getElementById(exitId).focus();
		
		//samsungdforum
		//widgetAPI.sendExitEvent(); 
	}
	
	this.dispose = function() {
		ime._blur();
		document.getElementById(exitId).focus();	
	};

	this.setString = function(str) {    	
		ime.setString(str);
	};

	this.setKeypadPos = function() {    	
		ime.setKeypadPos(690, 80);
	};
}


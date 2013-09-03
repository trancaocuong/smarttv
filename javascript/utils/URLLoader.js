function URLLoader() {
	
	this._events = {};
}

URLLoader.prototype.onComplete = function(src) {	
	this.dispatchEvent(Event.COMPLETE, [src]);
};

URLLoader.prototype.addEventListener = function(eventName, callback, target) {
	
	callback.target = target ? target : null;
	
	var events = this._events;
  
	callbacks = events[eventName] ? events[eventName] : [];
	callbacks.push(callback);
	
	events[eventName] = callbacks;
};

URLLoader.prototype.removeEventListener = function(eventName, callback) {

	var events = this._events;
  
	callbacks = events[eventName] ? events[eventName] : [];
 
	var index = callbacks.indexOf(callback);	
	if (index != -1) {
		callbacks.splice(index, 1);
	}
	
	events[eventName] = callbacks;
};

URLLoader.prototype.dispatchEvent = function(eventName, args) {
	var callbacks = this._events[eventName];
	
	for (var i = 0; i < callbacks.length; i++) {
		callbacks[i].apply(callbacks[i].target, args);
	}
};

URLLoader.prototype.load = function(url, param) {
	
	var xmlhttp;
	
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlhttp.target = this;
	xmlhttp.onreadystatechange = function() {
		//alert('URLLoader: ' + xmlhttp.readyState);
		
		if (xmlhttp.readyState && xmlhttp.readyState == 4 && xmlhttp.status && xmlhttp.status == 200) {
			xmlhttp.target.onComplete(xmlhttp.responseText);
		}
	};
	
	//alert(url + '?' + param);
	
	//xmlhttp.open('GET', url + "?" + param + '&random=' + Math.random(), true);
	xmlhttp.open('GET', url + "?" + param, true);
	xmlhttp.send(null);	
	
	//xmlhttp.open('POST', url, true);
	//xmlhttp.send(param);	
};
function KaraokeDisplay(engine, container, displayIndex) {
    this.type = KaraokeType.TYPE_KARAOKE;
    this._engine = engine;
    
    this._display = jQuery(document.createElement('div'));
    this._display.attr('class','karaoke-display');
    
    this._element = jQuery(document.createElement('div'));
    this._element.attr('class', 'karaoke-line');
    
    this._display.append(this._element);
    container.append(this._display);
    
    this._overlay = null;
    this._currentCSSClass = null;
    
    this._setClass();
    this.clear();
    
    this._temp = '';    
    this.passedTextWidth = 0;
    this.currentTextWidth = 0;   
	
};

//KaraokeDisplay._escapeHTML = function(str){
//    return str.replace(/&/g,'&amp;').replace(/</g,'&gt;').replace(/>/g,'&lt;');
//};

KaraokeDisplay.prototype._setClass = function(){
     var wantedClass = 'karaoke-type-karaoke';
     
     if(this.type == KaraokeType.TYPE_UPCOMING){
        wantedClass = 'karaoke-type-upcoming';
    } 
    
    else if(this.type == KaraokeType.TYPE_READY){
        wantedClass = 'karaoke-type-ready';
    }
    
    else if(this.type == KaraokeType.TYPE_INSTRUMENTAL){
        wantedClass = 'karaoke-type-instrumental';
    }
    
    if(wantedClass != this._currentCSSClass){
        this._display.attr('class', 'karaoke-display ' + wantedClass);
        this._currentCSSClass=wantedClass;
    }
};

KaraokeDisplay.prototype._removeOverlay = function(){
    if(this._overlay != null) {
        this._overlay.remove();
        this._overlay = null;
    }
};

KaraokeDisplay.prototype.clear = function(){
    this._element.html('&nbsp;');
    this._removeOverlay();
};

KaraokeDisplay.prototype.renderText = function(text) {
    this._setClass();
    this._element.text(text);
    this._removeOverlay();
};

KaraokeDisplay.prototype.renderReadyCountdown = function(countdown){
    var content = '(' + countdown + ')';
    this._setClass();
    this._element.text(content);
    this._removeOverlay();
};

KaraokeDisplay.prototype.renderInstrumental = function(){
    var content = '&#9835; &#9835 &#9835; &#9835; &#9835;';
    this._setClass();
    this._element.html(content);
    this._removeOverlay();
};

KaraokeDisplay.prototype.renderKaraoke = function(passed, current, upcoming, fragmentPercent) {
	
	var passedText = '';
    for(var i in passed) { 
        passedText += passed[i].text;
    }
    
    var upcomingText = '';
    for(var i in upcoming) {
        upcomingText += upcoming[i].text;
    }
    
    var content = passedText + current.text + upcomingText;
    
    var isNew = false;
    if (this._temp != content) {
    	isNew = true;
    	this._temp = content;
    	//alert('SHOW LINE: ' + content);
    }
    
    var strippedCurrentText = current.text.replace(/^\s+/,'');
    //alert(passedText + current.text);

    var test = jQuery('<div style="display: inline; visibility: hidden; '+'margin: 0; padding: 0; border: 0"></div>');
	this._element.parent().append(test);
	var totalTextWidth = test.text(content).width();    
	this.passedTextWidth = test.text(passedText).width();
	this.currentTextWidth = test.text(strippedCurrentText).width();
	
	test.remove();
	
    if (isNew) {
    	this._setClass();
    
    	var innerElement = jQuery(document.createElement('span'));
    	innerElement.text(content);
    	
    	//test border
    	//innerElement.css('border', '2px solid white');
    
    	this._element.empty();
    	this._element.append(innerElement);
    	
    	//create overlay
    	this._removeOverlay();
    	
    	var pos = innerElement.position();
        var innerElementLeft = pos.left;
        var elementHeight = this._element.height();
    	
    	var overlay = jQuery(document.createElement('div'));
        overlay.attr('class', 'karaoke-overlay');
        overlay.text(content);
        overlay.css('position', 'relative');
        overlay.css('white-space', 'nowrap');
        overlay.css('overflow', 'hidden');
        
        //fragmentPercent = 100;
        overlay.width(this.passedTextWidth + (fragmentPercent/100 * this.currentTextWidth));
        overlay.css('margin-top', '-' + elementHeight + 'px');
        //overlay.css('visibility', 'hidden');
        
        this._display.append(overlay);
        overlay.css('left', innerElementLeft - overlay.position().left);
        //overlay.css('visibility', '');
        this._overlay = overlay;
    } 
    
    else {    
    	//fragmentPercent = 100;
    	
    	//alert(strippedCurrentText);
    	//this._overlay.text(fragmentPercent);
    	this._overlay.width(this.passedTextWidth + (fragmentPercent/100 * this.currentTextWidth));
    	
    	//alert(fragmentPercent);
    	//this._overlay.css('left', 0);
    	//this._overlay.width(totalTextWidth);
    }
    
};
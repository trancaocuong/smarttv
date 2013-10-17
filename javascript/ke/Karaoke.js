function RiceKaraoke(timings) {

	this.timings = timings.sort(function(a, b) {
		if(a.start == b.start){
			return 0;
		}
		return a.start < b.start ? -1 : 1;
	});
}
RiceKaraoke.toTiming = function(lines) {
	var arrResult = [];
	var count = 0;
	
    for(var i in lines){     
    	arrResult[count++]= {
            start: lines[i][0],
            end: lines[i][1],
            line: RiceKaraoke.toLine(lines[i][2]),
            renderOptions: lines[i].length >= 4 ? lines[i][3] : {}
         };
	}
	return arrResult;
};

RiceKaraoke.toLine = function(arrWord) {
	var arrResult = [];
    var count = 0;
    
    for(var i in arrWord){
    	arrResult[count++] = {
            start: arrWord[i][0],
            text: arrWord[i][1],
            end: arrWord[i].length >= 3 ? parseFloat(arrWord[i][2]) : null,
            renderOptions: arrWord[i].length >= 4 ? arrWord[i][3] : {}
        };
    }
    
    return arrResult;
};

RiceKaraoke.prototype.createShow = function(displayEngine, numLines){
    return new RiceKaraokeShow(this, displayEngine, numLines);
};

function RiceKaraokeShow(engine, displayEngine, numLines) {
    this.showReady = true;
    this.showInstrumental = true;
    this.upcomingThreshold = 5;
    this.readyThreshold = 2;
    this.antiFlickerThreshold = 0.5;
    this._engine = engine;
    this._displayEngine = displayEngine;
    this._numLines = numLines;
    this._displays = [];
    this._index = 0;
    this._relativeLastKaraokeLine = 0;
    this._hasReadyLine = false;
    this._hasInstrumentalLine = false;
    
    this.reset();
}

RiceKaraokeShow.prototype.reset = function(){
    this._displays = [];
    for(var i = 0; i < this._numLines; i ++){
        this._displays[this._displays.length] = null;
        this._displayEngine.getDisplay(i).clear();
    }
    
    this._index = 0;
    this._relativeLastKaraokeLine = 0;
    this._hasReadyLine = false;
    this._hasInstrumentalLine = false;
};

RiceKaraokeShow.prototype.render = function(elapsed) {

    var freeDisplays = [];
    var displaysToClear = [];
    var unfreedDisplays = {};
    var displaysToUpdate = [];
    
    for(var i in this._displays) {
        if(this._displays[i] == null){
            freeDisplays[freeDisplays.length] = i;
        }
        
        else if(this._displays[i].end <= elapsed) {
            if(this._displays[i] instanceof KaraokeReadyLine){
                this._hasReadyLine = false;
            }
            
            if(this._displays[i]instanceof KaraokeInstrumentalLine) {
                this._hasInstrumentalLine = false;
            }
            
            var replacement = this._displays[i].expire(elapsed);
            
            if(replacement != null) {
                this._displays[i] = replacement;
            } else {
                freeDisplays[freeDisplays.length] = i;
                displaysToClear[displaysToClear.length] = i;
            }
        }
        
        else {
            displaysToUpdate[displaysToUpdate.length] = i;
        }
    }
    
    //alert(freeDisplays.length);
    
    if(freeDisplays.length > 0) {
        
        var timing;
        var freeDisplay;
    
        for(var i = this._index; i < this._engine.timings.length; i++) {
            if(freeDisplays.length == 0){
                break;
            }
            
            timing = this._engine.timings[i];
            
            if(timing.start <= elapsed && timing.end >= elapsed) {
                freeDisplay = freeDisplays.shift();
                
                unfreedDisplays[freeDisplay] = true;
                
                this._displays[freeDisplay] = new KaraokeLine(this.getDisplay(freeDisplay), elapsed, timing);
                this._relativeLastKaraokeLine = timing.end;
                this._index = i + 1;
            }
            
            else if((timing.start - this.upcomingThreshold <= elapsed || timing.start - this._relativeLastKaraokeLine < this.antiFlickerThreshold) && timing.end >= elapsed){
                freeDisplay = freeDisplays.shift();
                unfreedDisplays[freeDisplay] = true;
                
                this._displays[freeDisplay] = new KaraokeUpcomingLine(this.getDisplay(freeDisplay), elapsed, timing);
                this._index = i + 1;
                
                if(this.showReady && elapsed - this._relativeLastKaraokeLine >= this.readyThreshold && !this._hasReadyLine && freeDisplays.length >= 0){
                    freeDisplay = freeDisplays.shift();
                    unfreedDisplays[freeDisplay] = true;
                    
                    this._displays[freeDisplay] = new KaraokeReadyLine(this.getDisplay(freeDisplay), elapsed, timing.start - elapsed);
                    this._hasReadyLine=true;
                }
                
                this._relativeLastKaraokeLine = timing.end;
            }
            
            else if(this.showInstrumental && freeDisplays.length == this._displays.length && !this._hasInstrumentalLine) {
                freeDisplay = freeDisplays.shift();
                unfreedDisplays[freeDisplay] = true;
                
                this._displays[freeDisplay] = new KaraokeInstrumentalLine(this.getDisplay(freeDisplay), elapsed, timing.start - this.upcomingThreshold);                
                this._hasInstrumentalLine = true;
            }
            
            else if(timing.end > elapsed) {
                break;
            }
        }
    }
    
    if(displaysToClear.length > 0) {
        for(var i in displaysToClear) {
            if(!(displaysToClear[i] in unfreedDisplays)) {
                this._displays[displaysToClear[i]] = null;
                this._displayEngine.getDisplay(displaysToClear[i]).clear();
            }
        }
    }
    
    if(displaysToUpdate.length > 0) {
        for(var i in displaysToUpdate) {
            this._displays[displaysToUpdate[i]].update(elapsed);
        }
    }
};

RiceKaraokeShow.prototype.getDisplay = function(displayIndex){
    return this._displayEngine.getDisplay(displayIndex);
};

/****************************************************************
//
// KaraokeLine
//
****************************************************************/
function KaraokeLine(display, elapsed, timing) {
    
    this._timing = timing;
    this._elapsed = elapsed;
    this.end = timing.end;
    
    this._display = display;
    this._display.type = KaraokeType.TYPE_KARAOKE;
    
    this.update(elapsed);
};

KaraokeLine.prototype.update = function(elapsed){
    var passedFragments = [];
    var currentFragmentPercent = 0.0;
    var currentFragment = null;
    var upcomingFragments = [];
    
    var fragment;
    var fragmentEnd;
    
    for(var l = 0; l < this._timing.line.length; l ++){
        fragment = this._timing.line[l];
        
        if(this._timing.start + fragment.start <= elapsed){
        	
            if(currentFragment != null) {
                passedFragments[passedFragments.length] = currentFragment;
            }
            currentFragment = fragment;
            
            fragmentEnd = this._timing.line.end ? this._timing.line.end : (this._timing.line.length > l + 1 ? this._timing.line[l + 1].start : this._timing.end - this._timing.start);
            
            currentFragmentPercent = 10 + (elapsed - (this._timing.start + fragment.start))/(fragmentEnd - fragment.start) * 100;
            
        } else {
            upcomingFragments[upcomingFragments.length] = fragment;
        }
    }
    
    if (currentFragmentPercent > 100) {
    	currentFragmentPercent = 100;
    }	
    
    this._display.renderKaraoke(passedFragments, currentFragment, upcomingFragments, currentFragmentPercent);
    return true;
};

KaraokeLine.prototype.expire = function(elapsed) {
    return null;
};

/****************************************************************
//
// KaraokeUpcomingLine
//
****************************************************************/
function KaraokeUpcomingLine(display, elapsed, timing) {
    
    this._timing = timing;
    this._elapsed = elapsed;
    this.end = timing.start;
    
    var text = '';
    for(var i in timing.line){
        text += timing.line[i].text;
    }
    
    this._display = display;
    this._display.type = KaraokeType.TYPE_UPCOMING;
    this._display.renderText(text);
}

KaraokeUpcomingLine.prototype.update = function(elapsed) {
    return true;
};

KaraokeUpcomingLine.prototype.expire = function(elapsed){
    return new KaraokeLine(this._display, elapsed, this._timing);
};

/****************************************************************
//
// KaraokeReadyLine
//
****************************************************************/
function KaraokeReadyLine(display, elapsed, countdown) {    
    this._start = elapsed;
    this.end = elapsed + countdown;
    
    this._display = display;
    this._display.type = KaraokeType.TYPE_READY;
    this._display.renderReadyCountdown(Math.round(countdown + 1));
}

KaraokeReadyLine.prototype.update = function(elapsed) { 
    var countdown = this.end - elapsed;
    this._display.renderReadyCountdown(Math.round(countdown + 1));
    return true;
};

KaraokeReadyLine.prototype.expire = function(elapsed){
    return null;
};

/****************************************************************
//
// KaraokeInstrumentalLine
//
****************************************************************/
function KaraokeInstrumentalLine(display, elapsed, end) {
    this._start = elapsed;
    this.end = end;
    
    this._display = display;
    this._display.type = KaraokeType.TYPE_INSTRUMENTAL;
    this._display.renderInstrumental();
}

KaraokeInstrumentalLine.prototype.update = function(elapsed) {
    return true;
};

KaraokeInstrumentalLine.prototype.expire = function(elapsed) {
    return null;
};
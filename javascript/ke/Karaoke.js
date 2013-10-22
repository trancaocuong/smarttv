function Karaoke(timings) {

    timings = KaraokeUtils.toTiming(timings);

	this.timings = timings.sort(function(a, b) {
        if(a.start == b.start){
			return 0;
		}
        return a.start < b.start ? -1 : 1;
	});

    this.show = null;
};

Karaoke.prototype.init = function(displayId, numLines){    
    var renderer = new KaraokeDisplayEngine(displayId, numLines);

    this.show = new KaraokeShow(this, renderer, numLines);
};

Karaoke.prototype.render = function(elapsed){
    this.show.render(elapsed);
};

Karaoke.prototype.reset = function(){
    this.show.reset();
};


/****************************************************************
//
// KaraokeUtils
//
****************************************************************/
function KaraokeUtils(){

};

KaraokeUtils.toTiming = function(lines) {
    var arrResult = [];
    var count = 0;
    
    for(var i in lines){     
        arrResult[count++]= {
            start: lines[i][0],
            end: lines[i][1],
            line: KaraokeUtils.toLine(lines[i][2]),
            renderOptions: lines[i].length >= 4 ? lines[i][3] : {}
         };
    }
    return arrResult;
};

KaraokeUtils.toLine = function(arrWord) {
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

/****************************************************************
//
// KaraokeShow
//
****************************************************************/
function KaraokeShow(engine, displayEngine, numLines) {
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

KaraokeShow.prototype.reset = function(){
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

KaraokeShow.prototype.render = function(elapsed) {

    var freeDisplays = [];
    var displaysToClear = [];
    var unfreedDisplays = {};
    var displaysToUpdate = [];
    
    var replacement;

    //alert('');
    
    //alert('ELAPSED = ' + elapsed);

    for(var i in this._displays) {

        if(this._displays[i] == null) {
            freeDisplays.push(i);
        }
        
        else if(this._displays[i].end <= elapsed) {
            
            if(this._displays[i] instanceof KaraokeReadyLine) {
                this._hasReadyLine = false;
            }
            
            if(this._displays[i] instanceof KaraokeInstrumentalLine) {
                this._hasInstrumentalLine = false;
            }
            
            try {
            replacement = this._displays[i].expire(elapsed);
        } catch(err) {}
            
            //upcommingline appear here    
            if(replacement != null) {
                this._displays[i] = replacement;
                //alert('NEW LINE: ' + this._displays[i]._timing.start + '  -  ' + elapsed);
                
            } else {
                freeDisplays.push(i);
                displaysToClear.push(i);
            }
        }
        
        else {
            displaysToUpdate.push(i);
        }
    }
    
    if(freeDisplays.length > 0) {
       
        var timing;
        var freeDisplay;
    
        for(var i = this._index; i < this._engine.timings.length; i++) {
            
            if(freeDisplays.length == 0){
                //alert('NO DISPLAY');
                break;
            }
            
            timing = this._engine.timings[i];
            
            //if (timing.end == elapsed) {
            //    alert('END OF LINE:' + timing.end);
            //}

            //alert(i + ':' + timing.start + ':' + elapsed + ':' + timing.end);
            
            if(timing.start <= elapsed && elapsed <= timing.end) {
                freeDisplay = freeDisplays.shift();
                
                unfreedDisplays[freeDisplay] = true;
                
                this._displays[freeDisplay] = new KaraokeLine(this.getDisplay(freeDisplay), elapsed, timing);
                this._relativeLastKaraokeLine = timing.end;
                this._index = i + 1;

                //if (timing.end == elapsed) {
                //    alert('END OF LINE:' + timing.end);
                //}
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
                    this._hasReadyLine = true;
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
            //alert(i + ':' + displaysToUpdate[i]);
            this._displays[displaysToUpdate[i]].update(elapsed);
        }
    }
};

KaraokeShow.prototype.getDisplay = function(displayIndex){
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
    var upcomingFragments = [];
    
    var currentFragmentPercent = 0.0;
    var currentFragment = null;
    
    var fragment;
    var fragmentEnd;
    
    var time;

    //alert('');
    
    for(var i = 0; i < this._timing.line.length; i ++){
        fragment = this._timing.line[i];

        time = this._timing.start + fragment.start;
        time = Math.floor(time * 100) / 100;

        //alert(time + ':' + elapsed);

        //if(this._timing.start + fragment.start <= elapsed){
        if(time <= elapsed) {
        	
            if(currentFragment != null) {
                passedFragments.push(currentFragment);
            }

            currentFragment = fragment;
            
            fragmentEnd = this._timing.line.end ? this._timing.line.end : (this._timing.line.length > i + 1 ? this._timing.line[i + 1].start : this._timing.end - this._timing.start);
            
            currentFragmentPercent = (elapsed - time) / (fragmentEnd - fragment.start) * 100;
            
        } else {
            upcomingFragments.push(fragment);
        }

        if (i == this._timing.line.length - 1 && time == elapsed) {    
            //alert('');
            //alert('END LINE: ' + elapsed);   
        }
    }
    
    currentFragmentPercent = Math.ceil(currentFragmentPercent);

    //alert(currentFragmentPercent);
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
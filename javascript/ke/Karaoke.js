﻿function RiceKaraoke(timings){
	this.timings=timings.sort(function(a,b){
		if(a.start==b.start){
			return 0;
		}
		return a.start<b.start?-1:1;
	});
}
RiceKaraoke.simpleTimingToTiming = function(simpleTimings){
	var timings=[];
	var y=0;
	for(var i in simpleTimings){
		timings[y++]= {
            start:simpleTimings[i][0],
            end:simpleTimings[i][1],
            line:RiceKaraoke.simpleKarakokeToKaraoke(simpleTimings[i][2]),
            renderOptions:simpleTimings[i].length>=4?simpleTimings[i][3]:{}
         };
	}
	return timings;
};

RiceKaraoke.simpleKarakokeToKaraoke = function(simpleKaraoke){
	var karaoke=[];
    var y=0;
    for(var i in simpleKaraoke){
        karaoke[y++] = {
            start:simpleKaraoke[i][0],
            text:simpleKaraoke[i][1],
            end:simpleKaraoke[i].length>=3?parseFloat(simpleKaraoke[i][2]):null,
            renderOptions:simpleKaraoke[i].length>=4?simpleKaraoke[i][3]:{}
        };
    }
    return karaoke;
};

RiceKaraoke.prototype.createShow = function(displayEngine, numLines){
    return new RiceKaraokeShow(this,displayEngine,numLines);
};

function RiceKaraokeShow(engine,displayEngine,numLines) {
    this.showReady=true;
    this.showInstrumental=true;
    this.upcomingThreshold=5;
    this.readyThreshold=2;
    this.antiFlickerThreshold=.5;
    this._engine=engine;
    this._displayEngine=displayEngine;
    this._numLines=numLines;
    this._displays=[];
    this._index=0;
    this._relativeLastKaraokeLine=0;
    this._hasReadyLine=false;
    this._hasInstrumentalLine=false;
    this.reset();
}

RiceKaraokeShow.prototype.reset = function(){
    this._displays=[];
    for(var i=0;i<this._numLines;i++){
        this._displays[this._displays.length]=null;
        this._displayEngine.getDisplay(i).clear();
    }
    this._index=0;
    this._relativeLastKaraokeLine=0;
    this._hasReadyLine=false;
    this._hasInstrumentalLine=false;
};

RiceKaraokeShow.prototype.render=function(elapsed,accurate){
    if(accurate){
        var numDisplays=this._displays.length;
        for(var i=numDisplays;i>0;i--){
            this.render(elapsed- i/1000,false);
        }
        
        this._relativeLastKaraokeLine=0;
        for(var i=0;i<this._engine.timings.length;i++){
            if(this._engine.timings[i].start<elapsed&&this._engine.timings[i].end>this._relativeLastKaraokeLine){
                this._relativeLastKaraokeLine=this._engine.timings[i].end;
                break;
            }
        }
    }
    
    var freeDisplays=[];
    var displaysToClear=[];
    var unfreedDisplays={};
    var displaysToUpdate=[];
    
    for(var i in this._displays){
        if(this._displays[i]==null){
            freeDisplays[freeDisplays.length]=i;
        }
        
        else if(this._displays[i].end<=elapsed){
            if(this._displays[i]instanceof RiceKaraokeReadyLine){
                this._hasReadyLine=false;
            }
            if(this._displays[i]instanceof RiceKaraokeInstrumentalLine){
                this._hasInstrumentalLine=false;
            }
            
            var replacement=this._displays[i].expire(elapsed);
            if(replacement!=null){
                this._displays[i]=replacement;
            } else{
                freeDisplays[freeDisplays.length]=i;
                displaysToClear[displaysToClear.length]=i;
            }
        }
        
        else{
            displaysToUpdate[displaysToUpdate.length]=i;
        }
    }
    
    if(freeDisplays.length>0){
        for(var i=this._index;i<this._engine.timings.length;i++){
            if(freeDisplays.length==0){
                break;
            }
            
            var timing=this._engine.timings[i];
            
            if(timing.start<=elapsed&&timing.end>=elapsed){
                var freeDisplay=freeDisplays.shift();
                unfreedDisplays[freeDisplay]=true;
                this._displays[freeDisplay]=new RiceKaraokeKaraokeLine(this.getDisplay(freeDisplay),elapsed,timing);
                this._relativeLastKaraokeLine=timing.end;
                this._index=i+ 1;
            }
            
            else if((timing.start- this.upcomingThreshold<=elapsed||timing.start- this._relativeLastKaraokeLine<this.antiFlickerThreshold)&&timing.end>=elapsed){
                var freeDisplay=freeDisplays.shift();
                unfreedDisplays[freeDisplay]=true;
                this._displays[freeDisplay]=new RiceKaraokeUpcomingLine(this.getDisplay(freeDisplay),elapsed,timing);
                this._index=i+ 1;
                
                if(this.showReady&&elapsed- this._relativeLastKaraokeLine>=this.readyThreshold&&!this._hasReadyLine&&freeDisplays.length>=0){
                    var freeDisplay=freeDisplays.shift();
                    unfreedDisplays[freeDisplay]=true;
                    this._displays[freeDisplay]=new RiceKaraokeReadyLine(this.getDisplay(freeDisplay),elapsed,timing.start- elapsed);
                    this._hasReadyLine=true;
                }
                
                this._relativeLastKaraokeLine=timing.end;
            }
            
            else if(this.showInstrumental&&freeDisplays.length==this._displays.length&&!this._hasInstrumentalLine){
                var freeDisplay=freeDisplays.shift();
                unfreedDisplays[freeDisplay]=true;
                this._displays[freeDisplay]=new RiceKaraokeInstrumentalLine(this.getDisplay(freeDisplay),elapsed,timing.start- this.upcomingThreshold);                
                this._hasInstrumentalLine=true;
            }
            
            else if(timing.end>elapsed){
                break;
            }
        }
    }
    
    if(displaysToClear.length>0){
        for(var i in displaysToClear){
            if(!(displaysToClear[i]in unfreedDisplays)){
                this._displays[displaysToClear[i]]=null;
                this._displayEngine.getDisplay(displaysToClear[i]).clear();
            }
        }
    }
    
    if(displaysToUpdate.length>0){
        for(var i in displaysToUpdate){
            this._displays[displaysToUpdate[i]].update(elapsed)
        }
    }
};

RiceKaraokeShow.prototype.getDisplay = function(displayIndex){
    return this._displayEngine.getDisplay(displayIndex);
};

function RiceKaraokeKaraokeLine(display,elapsed,timing){
    this._display=display;
    this._timing=timing;
    this._elapsed=elapsed;
    this.end=timing.end;
    this._display.type=KaraokeType.TYPE_KARAOKE;
    this.update(elapsed);
};

RiceKaraokeKaraokeLine.prototype.update = function(elapsed){
    var passedFragments=[];
    var currentFragmentPercent=0.0;
    var currentFragment=null;
    var upcomingFragments=[];
    
    for(var l=0;l<this._timing.line.length;l++){
        var fragment=this._timing.line[l];
        
        if(this._timing.start+ fragment.start<=elapsed){
            if(currentFragment!=null){
                passedFragments[passedFragments.length]=currentFragment;
            }
            currentFragment=fragment;
            
            var fragmentEnd=this._timing.line.end?this._timing.line.end:(this._timing.line.length>l+ 1?this._timing.line[l+ 1].start:this._timing.end- this._timing.start);
            
            currentFragmentPercent=(elapsed-(this._timing.start+ fragment.start))/(fragmentEnd- fragment.start)*100;
            
        } else {
            upcomingFragments[upcomingFragments.length]=fragment;
        }
    }
    
    this._display.renderKaraoke(passedFragments,currentFragment,upcomingFragments,currentFragmentPercent);
    return true;
};

RiceKaraokeKaraokeLine.prototype.expire=function(elapsed){
    return null;
};

function RiceKaraokeUpcomingLine(display,elapsed,timing){
    this._display=display;
    this._timing=timing;
    this._elapsed=elapsed;
    this.end=timing.start;
    var text='';
    
    for(var i in timing.line){
        text+=timing.line[i].text;
    }
    
    this._display.type=KaraokeType.TYPE_UPCOMING;
    this._display.renderText(text);
}

RiceKaraokeUpcomingLine.prototype.update = function(elapsed) {
    return true;
};

RiceKaraokeUpcomingLine.prototype.expire = function(elapsed){
    return new RiceKaraokeKaraokeLine(this._display,elapsed,this._timing);
};

function RiceKaraokeReadyLine(display,elapsed,countdown){
    this._display=display;
    this._start=elapsed;
    this.end=elapsed+ countdown;
    this._display.type = KaraokeType.TYPE_READY;
    this._display.renderReadyCountdown(Math.round(countdown+ 1));
}

RiceKaraokeReadyLine.prototype.update = function(elapsed) { 
    var countdown = this.end - elapsed;
    this._display.renderReadyCountdown(Math.round(countdown+ 1));
    return true;
};

RiceKaraokeReadyLine.prototype.expire = function(elapsed){
    return null;
};

function RiceKaraokeInstrumentalLine(display,elapsed,end){
    this._display=display;
    this._start=elapsed;
    this.end=end;
    this._display.type=KaraokeType.TYPE_INSTRUMENTAL;
    this._display.renderInstrumental();
}

RiceKaraokeInstrumentalLine.prototype.update = function(elapsed){
    return true;
};

RiceKaraokeInstrumentalLine.prototype.expire=function(elapsed){
    return null;
};
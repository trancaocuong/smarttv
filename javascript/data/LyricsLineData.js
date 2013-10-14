function LyricsLineData(value) {		
	this.arrLyrics = new Array();
	
	this.strContent = '';	
};

LyricsLineData.prototype.addLine = function(lyricsData) {
	this.arrLyrics.push(lyricsData);
	
	if (this.strContent != '') {
		this.strContent += ' ';
	}	
	this.strContent += lyricsData.getText();
};

LyricsLineData.prototype.getContent = function() {
	return this.strContent;
};

LyricsLineData.prototype.getTime = function(index) {
	
};

LyricsLineData.prototype.from = function() {
	return this.arrLyrics[0].getTime();;
};

LyricsLineData.prototype.to = function() {
	return this.arrLyrics[this.arrLyrics.length - 1].getTime();
};

LyricsLineData.prototype.contains = function(time) {	
	var min = this.arrLyrics[0].getTime();
	var max = this.arrLyrics[this.arrLyrics.length - 1].getTime();
	
	return (time >= min && time <= max);	
};

LyricsLineData.prototype.toArray = function() {
    
    var from = this.from()/1000;
    from = Math.floor(from * 1000) / 1000;
    
    var to = this.to()/1000;
    to = Math.floor(to * 1000) / 1000;

	var arr = [from, to];	    
    var current;
	
	var arrTemp = [];
	var time = 0;
	for (var i = 0; i < this.arrLyrics.length; i ++) {
		if (i == 0) {
            time = 0;
        } else {
			time = this.arrLyrics[i].getTime() - time;
		}
		
        current = time/1000;
        current = Math.floor(current * 1000) / 1000;
        
		arrTemp.push([current, this.arrLyrics[i].getText() + ' ']);
		
		time = this.arrLyrics[i].getTime();
        
       // alert(this.arrLyrics[i].getTime());
        //alert(current);
	}
    
    //alert('');
	
	arr.push(arrTemp);
	
	return arr;	
};


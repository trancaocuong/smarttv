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
	var arr = [this.from()/1000, this.to()/1000];	
	
	var arrTemp = [];
	var time = 0;
	for (var i = 0; i < this.arrLyrics.length; i ++) {
		
		if (time != 0) {
			time = this.arrLyrics[i].getTime() - time;
		}
		
		arrTemp.push([time/1000, this.arrLyrics[i].getText() + ' ']);
		
		time = this.arrLyrics[i].getTime();
	}
	
	arr.push(arrTemp);
	
	return arr;	
};


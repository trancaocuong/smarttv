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

LyricsLineData.prototype.contains = function(time) {	
	var min = this.arrLyrics[0].getTime();
	var max = this.arrLyrics[this.arrLyrics.length - 1].getTime();
	
	alert(min + '-' + time + '-' + max);
	
	return (time >= min && time <= max);	
};

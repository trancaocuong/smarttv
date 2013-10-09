function LyricsDataProvider(value) {	
	this.arrLine = new Array();
	
	this.temp = null;
	
};

LyricsDataProvider.prototype.addLineData = function(value) {
	
	value = (value != '' || value != undefined) ? value : '';	
	value = $.trim(value);		
	
	if (value != '') {
		var lyricsData = new LyricsData(value);
		
		if (lyricsData.getText() == '') {
			this.arrLine.push(this.temp);
			this.temp = null;			
		} else {
			if (this.temp == null) {
				this.temp = new LyricsLineData();
			}
			this.temp.addLine(lyricsData);
		}
	}	
};

LyricsDataProvider.prototype.getTotalLines = function() {
	return this.arrLine.length;
};

LyricsDataProvider.prototype.getLinesAt = function(index) {
	return (index < this.arrLine.length) ?  this.arrLine[index] : null;
};

LyricsDataProvider.prototype.getLyricsLineAt = function(time) {	
	
	for (var i = 0; i < this.arrLine.length; i ++) {
		if (this.arrLine[i].contains(time)) {
			return this.arrLine[i];
		}
	}
	return null;
};

LyricsDataProvider.prototype.toArray = function(time) {	
	var arr = [];
	var line;
	for (var i = 0; i < this.arrLine.length; i ++) {
		line = this.arrLine[i].toArray();
		arr.push(line);
	}
	return arr;
}

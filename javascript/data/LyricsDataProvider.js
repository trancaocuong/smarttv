function LyricsDataProvider(value) {	
	this.arrLine = new Array();
	
	this.temp = null;
	
};

LyricsDataProvider.prototype.addLineData = function(value, isLast) {
	
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

		if (isLast && this.temp) {
			this.arrLine.push(this.temp);
			this.temp = null;
		}		
	}	
};

LyricsDataProvider.prototype.toArray = function(time) {	
	var arr = [];
	var line;
	for (var i = 0; i < this.arrLine.length; i ++) {
		line = this.arrLine[i].toArray( i < this.arrLine.length - 1 ? this.arrLine[i + 1] : null);		 
		arr.push(line);
	}
	return arr;
};

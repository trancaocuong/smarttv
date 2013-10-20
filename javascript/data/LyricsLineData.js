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

LyricsLineData.prototype.from = function() {
	return this.arrLyrics[0].getTime();;
};

LyricsLineData.prototype.to = function() {
	return this.arrLyrics[this.arrLyrics.length - 1].getTime();
};

LyricsLineData.prototype.toArray = function(previous) {
	
	var arrTemp = [];
	var start = 0;
	var current = 0;
	
	//alert('');
	for (var i = 0; i < this.arrLyrics.length; i ++) {
		if (i == 0) {
            start = this.arrLyrics[i].getTime();
        } 

		current = this.arrLyrics[i].getTime() - start;
		
		current = current/1000;
        
        current = Math.floor(current * 100) / 100;
        
        //alert(current + ':' + this.arrLyrics[i].getText());

        if (i < this.arrLyrics.length - 1) {	
       		arrTemp.push([current, this.arrLyrics[i].getText() + ' ']);
       	} else {
       		arrTemp.push([current, this.arrLyrics[i].getText()]);	
       	}	
	}

	var from = this.from()/1000;
    from = Math.floor(from * 100) / 100;
    
    var to = this.to()/1000;
    to = Math.floor(to * 100) / 100;

	var arr = [from, to];	    
    arr.push(arrTemp);
    
	//alert(arr);
    
    
    return arr;	
};


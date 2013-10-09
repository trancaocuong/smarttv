function LyricsData(value) {
	
	var arrStr = value.split('\t');
	
	var time = arrStr.length > 0 ? arrStr[0] : null;
	var text = arrStr.length > 1 ? $.trim(arrStr[1]) : '';
	
	return {
		
		getText: function() {			
			return text;
		},
		
		getTime: function() {
			return time;
		}		
	};	
};
console.log("UtilsClass CLASS is connected");	
// var geoip = require('./../lib/geoip/geoip');

Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };


/*
	function return count of bytes in string
	
	example:
	var str = "string";
	console.log('Length: ', str.byteLength(), ' byte(s)');
*/
String.prototype.byteLength = function(){
	var str = this, length = str.length, count = 0, i = 0, ch = 0;
	for(i; i < length; i++){
		ch = str.charCodeAt(i);
		if (0xD800 <= ch && ch <= 0xDBFF) {
			// верхний вспомогательный
			var next = str.charCodeAt(i+1);
			ch += next;
			i++;
		}
		if(ch <= 127){
			count++;
		}else if(ch <= 2047){
			count += 2;
		}else if(ch <= 65535){
			count += 3;
		}else if(ch <= 2097151){
			count += 4;
		}else if(ch <= 67108863){
			count += 5;
		}else{
			count += 6;
		}    
	}
	return count;
};


/*
	function return number of elent by bytes
*/
String.prototype.NumberByByte = function(number_of_bytes){
	var str = this, length = str.length, count = 0, i = 0, ch = 0;
	for(i; i < length; i++){
		ch = str.charCodeAt(i);
		if (0xD800 <= ch && ch <= 0xDBFF) {
			// верхний вспомогательный
			var next = str.charCodeAt(i+1);
			ch += next;
			i++;
		}
		if(ch <= 127){
			count++;
		}else if(ch <= 2047){
			count += 2;
		}else if(ch <= 65535){
			count += 3;
		}else if(ch <= 2097151){
			count += 4;
		}else if(ch <= 67108863){
			count += 5;
		}else{
			count += 6;
		}
		if(count >= number_of_bytes)
			break;
	}
	return i+1;
};


exports.closeSocket = function(soc) {
	if(soc.empty_connection)
	{
		soc.destroy(); 
	}
}


exports.return_bytes = function return_bytes(str) {
	var temp0=''+str.byteLength()+'';
	while(temp0.length < 6) 
	{
		temp0 = '0'+temp0;
	}
	return temp0;
}

/*
exports.getCountryByIp = function(ip) {
	var geo = geoip.lookup(ip);
	var country = "";
	if (geo && geo.country) {
		country = geo.country;
	}
		
	return country;
}
*/
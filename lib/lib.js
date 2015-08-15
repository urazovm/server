console.log("lib package is connected");
var geoip = require('./../lib/geoip/geoip');


Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };


exports.objectSize = function(obj) {
    var size = 0, key;
	if(!obj)
		return size;
		
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


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


exports.closeSocket = function(soc) 
{
	if(soc.empty_connection)
	{
		soc.destroy(); 
	}
}


exports.return_bytes = function return_bytes(str)
{
	var temp0=''+str.byteLength()+'';
	while(temp0.length < 6) 
	{
		temp0 = '0'+temp0;
	}
	return temp0;
}


exports.validateEmail = function(email) { 
    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return re.test(email);
} 




exports.getCountryByIp = function(ip)
{
	var geo = geoip.lookup(ip);
	var country = "";
	if (geo && geo.country)
		country = geo.country;
		
	return country;
}


/*
	* Description:
	*	Листнер для домейна
	*	
	*	
	*	
	*
	* @since  26.07.15
	* @author pcemma
*/
exports.domainL = function(er) 
{
	console.log('### ERROR', er.stack);
	
	// Добавить новую ошибку либо обновить статус у старой
	Mongo.findAndModify(	
		'game_ErrorsServerList', 
		{error: er.stack}, 
		[],  
		{
			$set: {error: er.stack},
			$inc: {count: 1}
		},
		{
			upsert: true,
			new: true
		},
		function(doc){
			// Проверяем не повторялась ли ошибка, либо что это новая ошибка
			// В этом случае надо обновить в БД state.
			var insertData = {$set:{state: ((doc.value.state > 0) ? 2 : 0)}};
			Mongo.update('game_ErrorsServerList', {_id: doc.value._id}, insertData, function(){});
			
			// Занести в список ошибок (лист)
			Mongo.insert('game_ErrorsServer', {date: + new Date(), errorId: doc.value._id.toHexString()}, function(doc){});
		}
	);
}


console.log("lib package is connected");
var geoip = require('./../lib/geoip/geoip');


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
    //TODO: возможно тут \/ - могут быть проблемы
    var re = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
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
	Mongo.findAndModify({	
		collection: 'game_ErrorsServerList', 
		criteria: {error: er.stack}, 
		update: {
			$set: {error: er.stack},
			$inc: {count: 1}
		},
		options: {
			upsert: true,
			new: true
		},
		callback: function(doc) {
			// Проверяем не повторялась ли ошибка, либо что это новая ошибка
			// В этом случае надо обновить в БД state.
			var insertData = {$set:{state: ((doc.value.state > 0) ? 2 : 0)}};
			Mongo.update({collection: 'game_ErrorsServerList', searchData: {_id: doc.value._id}, insertData: insertData});
			
			// Занести в список ошибок (лист)
			Mongo.insert({
				collection: 'game_ErrorsServer', 
				insertData: {
					date: + new Date(), 
					errorId: doc.value._id.toHexString()
				}
			});
		}
	});
}



/*
	* Description:
	*	function that log clients error
	*	
	*	@response:	response object
	*	@data: 	json, Data from client
	*	
	*
	* @since  26.07.15
	* @author pcemma
*/
exports.makeClientsErrorLogs = function (data) {
	console.log("data.error_message",data);
	data.userId = data.userId;
	if(data.userId || data.userId === 0) {
		// Добавить новую ошибку либо обновить статус у старой
		
		Mongo.findAndModify({
			collection: 'game_ErrorsClientList', 
			criteria: {functionName: data.functionName}, 
			update : {
				$set: { 
					functionName: data.functionName, 
					error: data.error
				},
				$inc: {count: 1}
			}, 
			options: {
				upsert: true,
				new: true
			}, 
			callback: function(doc) {
				var insertData = {$set:{}};
				// Проверяем не увеличилась ли клиент версия, на которой случилась ошибка, либо что это новая ошибка
				// В этом случае надо обновить в БД поля clientVersion и state.
				if(
					(doc.value.clientVersion &&
					GLOBAL.checkVersion(data.clientVersion, doc.value.clientVersion)) ||
					!(doc.value.clientVersion)
				){
					insertData["$set"].clientVersion = data.clientVersion;
					insertData["$set"].state = (doc.value.state > 0) ? 2 : 0; 
				}
				Mongo.update({collection: 'game_ErrorsClientList', searchData: {_id: doc.value._id}, insertData: insertData});
				
				// Занести в список ошибок (лист)
				Mongo.insert({
					collection: 'game_ErrorsClient', 
					insertData: {
						date: + new Date(), 
						errorId: doc.value._id.toHexString(), 
						clientVersion: data.clientVersion, 
						userId: data.userId
					}
				});
			}

		});
	}
}


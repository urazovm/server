console.log("ErrorHandlerClass CLASS is connected");	

function ErrorHandlerClass () {

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
ErrorHandlerClass.prototype.logServerError = function(er) {
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
			Mongo.update({
				collection: 'game_ErrorsServerList', 
				searchData: {_id: doc.value._id}, 
				insertData: insertData
			});
			
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
	*	@er: 	json, Data from client
	*	
	*
	* @since  26.07.15
	* @author pcemma
*/
ErrorHandlerClass.prototype.logClientError = function (er) {
	console.log("er.error_message",er);
	er.userId = er.userId;
	if(er.userId || er.userId === 0) {
		// Добавить новую ошибку либо обновить статус у старой
		
		Mongo.findAndModify({
			collection: 'game_ErrorsClientList', 
			criteria: {functionName: er.functionName}, 
			update : {
				$set: { 
					functionName: er.functionName, 
					error: er.error
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
					GLOBAL.checkVersion(er.clientVersion, doc.value.clientVersion)) ||
					!(doc.value.clientVersion)
				){
					insertData["$set"].clientVersion = er.clientVersion;
					insertData["$set"].state = (doc.value.state > 0) ? 2 : 0; 
				}
				Mongo.update({
					collection: 'game_ErrorsClientList', 
					searchData: {_id: doc.value._id}, 
					insertData: insertData
				});
				
				// Занести в список ошибок (лист)
				Mongo.insert({
					collection: 'game_ErrorsClient', 
					insertData: {
						date: + new Date(), 
						errorId: doc.value._id.toHexString(), 
						clientVersion: er.clientVersion, 
						userId: er.userId
					}
				});
			}
		});
	}
}

module.exports = ErrorHandlerClass;
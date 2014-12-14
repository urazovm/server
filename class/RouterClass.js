console.log("Router CLASS is connected");	


function Router() {
	
	
	/*
		* Description:
		*	function convert params to JSON and send to client
		*	
		*	@response:	response object
		*	@params: array of params for server answer
		*	
		*
		* @since  08.02.14
		* @author pcemma
	*/
	var sendDataToUser = function(response, params)
	{
		// console.log("BEGIN S ===========");
		// console.log(params);
		// console.log("END S ===========\n");
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(JSON.stringify(params));
		response.end();
	}
	
	
	/*
		*	@Function делает перенаправлениа запроса. 
		*		Выбирает нужную функцию для текущего запрос и запускает ее. 
		*		Перед запуском обрабаотывает строку с данными, переводит в массив из json
		*
		*	@pathname:	str, путь запроса(роут)
		*	@response:	obj, обект ответа от сервера. через этот объект будет отправлен ответ клиенту
		*	@postData:	str(json), данные запроса от клиента.  
		*
		* @since  16.02.14
		* @author pcemma
	*/
	this.route = function(pathname, response, postData) {
		if (typeof (this[pathname]) === 'function') {
			postData = JSON.parse(postData);
			// GLOBAL CHECKING IF USER EXIST AND VERIFYING
			if( pathname == '/auth' || ( GLOBAL.USERS[postData.userId] && GLOBAL.USERS[postData.userId].verifyHash == postData.verifyHash))
				// delete postData.verifyHash;
				this[pathname](response, postData);
			else
				response.end();
				
		} else {
			console.log("No request handler found for " + pathname);
			this['/'](response, postData);
		}
	}
	
	
	/*
		* Description:
		*	function that called if empty request with route "/".
		*	
		*	@response:	response object
		*	@data: 	object, Data from client
		*	
		*
		* @since  08.02.14
		* @author pcemma
	*/

	this['/'] = function (response, data) {
		// console.log("No request handler found for empty");
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	}

	
	/*
		* Description:
		*	function that log clients error
		*	
		*	@response:	response object
		*	@data: 	json, Data from client
		*	
		*
		* @since  31.03.14
		* @author pcemma
	*/

	this['/makeClientsErrorLogs'] = function (response, data) {
		console.log("data.error_message",data);
		data.functionName	 = escape(data.functionName	);
		data.error = escape(data.error);
		var find_error = false;
		
		for(var key in GLOBAL.errorsLists.clientsErrorsList)
		{
			if(GLOBAL.errorsLists.clientsErrorsList[key].functionName == data.functionName && GLOBAL.errorsLists.clientsErrorsList[key].error == data.error)
			{
				console.log("find error!!!!!!!!!!!");
				if(GLOBAL.checkVersion(escape(data.clientVersion), GLOBAL.errorsLists.clientsErrorsList[key].clientVersion) )
				{
					console.log("Version is >>>>>= !!!!!!!!!!!");
					console.log("GLOBAL.errorsLists.clientsErrorsList[key].state", GLOBAL.errorsLists.clientsErrorsList[key].state);
					if(GLOBAL.errorsLists.clientsErrorsList[key].state == 1)
					{
						GLOBAL.errorsLists.clientsErrorsList[key].state = 2;
						GLOBAL.errorsLists.clientsErrorsList[key].clientVersion = escape(data.clientVersion);
					}
					console.log("GLOBAL.errorsLists.clientsErrorsList[key].state", GLOBAL.errorsLists.clientsErrorsList[key].state);
					SQL.querySync("UPDATE `game_ErrorsClientList` SET `state` = "+GLOBAL.errorsLists.clientsErrorsList[key].state+", `clientVersion` = '"+escape(data.clientVersion)+"' WHERE `id` = "+key);
				}
				find_error = true;
				break;
			}
		}
		if(!find_error)
		{
			var error_id = SQL.lastInsertIdSync("INSERT INTO `game_ErrorsClientList` SET `functionName` = '"+data.functionName+"', `error` = '"+data.error+"', `clientVersion` = '"+escape(data.clientVersion)+"', state = 0 ");
			GLOBAL.errorsLists.clientsErrorsList[error_id] = {functionName: data.functionName, error: data.error, clientVersion:escape(data.clientVersion), state: 0};
		}
		// update errors log
		SQL.querySync("INSERT INTO `game_ErrorsClient` SET `date` = UNIX_TIMESTAMP(), `functionName` = '"+data.functionName+"', `error` = '"+data.error+"', `clientVersion` = '"+escape(data.clientVersion)+"', userId ="+data.userId);
		response.end();
	}
		
	
	/*
		* Description:
		*	function that crontab, check what event need to do now
		*	
		*	
		*
		* @since  18.03.14
		* @author t
	*/

	this.crontab = function () {
		var currentTime = Math.floor(+new Date() / 1000);
		
		// CHECK PING FOR ALL USERS, IF PING < THEN REMOVE USER FROM ARRAY
		for (var key in GLOBAL.USERS){
			if ( key != 1 && (currentTime - GLOBAL.USERS[key].ping) > 40 )				
				this.removeUserFromServer(key);
		}
		
		// MARCHES
		for (var i in GLOBAL.MAP.marches){
			// console.log("\ncurrentTime: "+currentTime, "marchId: "+i, "isMarchArrived: "+GLOBAL.MAP.marches[i].isMarchArrived(), "isOnlineMarchCreator: "+!GLOBAL.MAP.marches[i].isOnlineMarchCreator(),"retrieveMarchFlag: "+GLOBAL.MAP.marches[i].retrieveMarchFlag, "marchGatherResourceFlag: "+GLOBAL.MAP.marches[i].marchGatherResourceFlag)
			
			if ( GLOBAL.MAP.marches[i].isMarchArrived() && !GLOBAL.MAP.marches[i].isOnlineMarchCreator()){ //  
				// console.log("CRONTAB isMarchArrived",i)
				if ( GLOBAL.MAP.marches[i].marchGatherResourceFlag ){
					// console.log("CRONTAB checkMarchResourceResult",i)
					GLOBAL.MAP.marches[i].checkMarchResourceResult();					
					if (GLOBAL.MAP.marches[i].removeMarchFlag)
						delete GLOBAL.MAP.marches[i];					
				}else if ( !GLOBAL.MAP.marches[i].retrieveMarchFlag ){
					// console.log("CRONTAB checkMarchResult",i)
					GLOBAL.MAP.marches[i].checkMarchResult();
					
					if (GLOBAL.MAP.marches[i].removeMarchFlag)
						delete GLOBAL.MAP.marches[i];
				}else{
					GLOBAL.MAP.marches[i].checkMarchEnd();
					delete GLOBAL.MAP.marches[i];
				}
			}
		}
		
		// WARS
		for (var i in GLOBAL.HELP.wars.byId){		
			if ( !GLOBAL.HELP.wars.byId[i].endOfWarRecruitmentFlag && GLOBAL.HELP.wars.byId[i].endTime <= currentTime){
				if( AM.checkWarMembersOnline({warId: String(i)}) )
					AM.checkEndOfWarRecruitment({warId: String(i)});
			}
		}		
		
		setTimeout(function(that){ that.crontab() }, 5000, this);
	}	
	
	
	/*
		* Description:
		*	function that remove user from global array because user offline
		*	
		* @ userId - USER ID	
		*
		* @since  26.03.14
		* @author t
	*/

	this.removeUserFromServer = function (userId) {
		console.log("remove user", userId);
		if (GLOBAL.USERS[userId]){
			// REMOVE USERS GROM ONLINE USERS OF STATE
			// delete GLOBAL.STATES[GLOBAL.USERS[userId].data.castle.K].users[userId];
		
			// CLEAR AREAS ARRAY FROM THIS USER
			for (var areaId in GLOBAL.USERS[userId].usersAreas)
				GLOBAL.removeUserFromAreasArray(areaId, userId);
		}		
		delete GLOBAL.USERS[userId];		
	}	
	
	
	
	/**************** AUTH ****************/
	
	
	
	/*
		* Description:
		*	function that make user auth.
		*	
		*	@response:	response object
		*	@data: 	object, Data from client
		*	
		*
		* @since  13.02.14
		* @author pcemma,t
	*/
	this['/auth'] = function (response, data) {
		var new_user = new UserClass();
		var user_id = new_user.check(data);

		if(user_id)
		{
			// TODO придумать как будет себя вести вся система когда ползьваотеля
			if(!GLOBAL.USERS[user_id]){
				console.log("NO USER ARRAY!");
				GLOBAL.USERS[user_id] = new_user;
				GLOBAL.USERS[user_id].auth({userId: user_id});
			}
			else
			{	
				console.log("EXIST USER ARRAY!");
				// NEED TO DELETE ARRAY, BECAUSE IT CONTAINS OLD DATA!!!!
				this.removeUserFromServer(user_id);
				// delete GLOBAL.USERS[user_id];
				GLOBAL.USERS[user_id] = new_user;
				GLOBAL.USERS[user_id].auth({userId: user_id});
			}
			
			// ADD USER TO ONLINE USERS OF STATE
			// GLOBAL.STATES[GLOBAL.USERS[user_id].data.castle.K].users[user_id] = user_id;
			
			// SEND DATA TO CLIENT
			sendDataToUser(response, {f: 'authorization', p: {
																// проверяем версию Данных
																globalData: (Number(data.globalDataVersion) != Number(GLOBAL.globalConstants.globalDataVersion) || config._DEBUG) ? GLOBAL.DATA : {}, 
																globalDataVersion: GLOBAL.globalConstants.globalDataVersion,
																data: GLOBAL.USERS[user_id].data, 
																userId: user_id, 
																verifyHash: GLOBAL.USERS[user_id].verifyHash, 
																login: GLOBAL.USERS[user_id].login
															}});
		}else{
			response.end();
		}
	}
	
	
	

}

module.exports = Router;


console.log("Router CLASS is connected");	


function Router() {
	
	

	/*
		*	@Function делает перенаправлениа запроса. 
		*		Выбирает нужную функцию для текущего запрос и запускает ее. 
		*		Перед запуском обрабаотывает строку с данными, переводит в массив из json
		*
		*	@pathname:	str, путь запроса(роут)
		*	@postData:	str(json), данные запроса от клиента.  
		*
		* @since  16.02.14
		* @author pcemma
	*/
	this.route = function(pathname, postData) {
		console.log("pathname", pathname);
		if (typeof (this[pathname]) === 'function') {
			// postData = JSON.parse(postData);
			// console.log(postData);
			// GLOBAL CHECKING IF USER EXIST AND VERIFYING
			if( pathname == 'getGlobalData' || pathname == 'authorization' || ( GLOBAL.USERS[postData.userId] && GLOBAL.USERS[postData.userId].verifyHash == postData.verifyHash)){
				this[pathname](postData);
			}
		} else {
			console.log("No request handler found for " + pathname);
			this['/'](postData);
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
		console.log("No request handler found for empty");
		// response.writeHead(404, {"Content-Type": "text/plain"});
		// response.write("404 Not found");
		// response.end();
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
	this['makeClientsErrorLogs'] = function (data) {
		console.log("data.error_message",data);
		var find_error 		= false;
		
		for(var key in GLOBAL.errorsLists.clientsErrorsList)
		{
			if(GLOBAL.errorsLists.clientsErrorsList[key].functionName == data.functionName && GLOBAL.errorsLists.clientsErrorsList[key].error == data.error)
			{
				console.log("find error!!!!!!!!!!!");
				if(GLOBAL.checkVersion(data.clientVersion, GLOBAL.errorsLists.clientsErrorsList[key].clientVersion) )
				{
					console.log("Version is >>>>>= !!!!!!!!!!!");
					if(GLOBAL.errorsLists.clientsErrorsList[key].state == 1)
					{
						GLOBAL.errorsLists.clientsErrorsList[key].state = 2;
						GLOBAL.errorsLists.clientsErrorsList[key].clientVersion = data.clientVersion;
					}
					SQL.querySync("UPDATE `game_ErrorsClientList` SET `state` = "+GLOBAL.errorsLists.clientsErrorsList[key].state+", `clientVersion` = '"+SQL.mysqlRealEscapeString(data.clientVersion)+"' WHERE `id` = "+key);
				}
				find_error = true;
				break;
			}
		}
		if(!find_error)
		{
			var error_id = SQL.lastInsertIdSync("INSERT INTO `game_ErrorsClientList` SET `functionName` = '"+SQL.mysqlRealEscapeString(data.functionName)+"', `error` = '"+SQL.mysqlRealEscapeString(data.error)+"', `clientVersion` = '"+SQL.mysqlRealEscapeString(data.clientVersion)+"', state = 0 ");
			GLOBAL.errorsLists.clientsErrorsList[error_id] = {functionName: data.functionName, error: data.error, clientVersion: data.clientVersion, state: 0};
		}
		// update errors log
		SQL.querySync("INSERT INTO `game_ErrorsClient` SET `date` = UNIX_TIMESTAMP(), `functionName` = '"+SQL.mysqlRealEscapeString(data.functionName)+"', `error` = '"+SQL.mysqlRealEscapeString(data.error)+"', `clientVersion` = '"+SQL.mysqlRealEscapeString(data.clientVersion)+"', userId ="+data.userId);
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
			// for (var areaId in GLOBAL.USERS[userId].usersAreas)
				// GLOBAL.removeUserFromAreasArray(areaId, userId);
		}		
		delete GLOBAL.USERS[userId];		
	}	
	
	
	
	
	/**************** AUTH ****************/
	
	/*
		* Description:
		*	function Проверяет версиию данных у пользователя и возвращает ему новые если надо
		*	
		*	@data: 	object, Data from client
		*	
		*
		* @since  26.01.15
		* @author pcemma
	*/
	this['getGlobalData'] = function (data) {
		// SEND DATA TO CLIENT
		var sendData =  {
						// проверяем версию Данных
						globalData: (Number(data.globalDataVersion) != Number(GLOBAL.globalConstants.globalDataVersion) || config._DEBUG) ? GLOBAL.DATA : {}, 
						globalDataVersion: GLOBAL.globalConstants.globalDataVersion
					};
		if(data.socket){
			data.socket.empty_connection = false;
			clearTimeout(data.socket.timer_for_off_empty_socket);
			var string_params = JSON.stringify({f: "getGlobalDataResponse", p: sendData});
			var bytes_count = lib.return_bytes(string_params);
			data.socket.write(bytes_count+string_params);
		}
	}
	
	
	/*
		* Description:
		*	function that make user auth.
		*	
		*	@data: 	object, Data from client
		*	
		*
		* @since  25.01.15
		* @author pcemma
	*/
	this['authorization'] = function (data) {
		var newUser = new UserClass(),
			userId,
			tempAutoConfigData = {},
			autoConfigData = {},
			sendData = {incorrectFlag: true};
		
		
		console.log("authorization");
		console.log(data.autoConfigData);
		// проверяем на то что такой пользователь есть и верно введены данные для авторизации
		if(
			data.autoConfigData && 
			((data.autoConfigData.email && data.autoConfigData.email != "") ||
			(data.autoConfigData.password && data.autoConfigData.password != ""))
		){
			// Тут проверка без учета самого пользователя, который может проверять
			userId = newUser.check(data.autoConfigData);
			console.log("userId", userId);
		}
		// проверка на то что мы делаем нового гостя. поля мейл и пароль пусты
		else{
			tempAutoConfigData = newUser.addNewUser(data);
			userId = tempAutoConfigData.userId;
			autoConfigData.email = tempAutoConfigData.email;
			autoConfigData.password = tempAutoConfigData.password;
			autoConfigData.login = tempAutoConfigData.login;
		}
		
		// мы удачно все прошли, нашли нужного пользователя с теми данными что прислыли, либо создали гостя
		if(userId)
		{
			data.userId = userId;
			if(!GLOBAL.USERS[userId] || lib.objectSize(GLOBAL.USERS[userId]) <= 0){
				console.log("NO USER ARRAY!");
				GLOBAL.USERS[userId] = newUser;
				GLOBAL.USERS[userId].getUserData(userId);
			}
			//TODO: auth должна возвращать поидее массив с данными для клиента. в кеше все данные есть, если их нет то при auth они создатуся в кеше
			GLOBAL.USERS[userId].auth(data);
			
			// SEND DATA TO CLIENT
			sendData =  {
							// проверяем версию Данных
							// globalData: (Number(data.globalDataVersion) != Number(GLOBAL.globalConstants.globalDataVersion) || config._DEBUG) ? GLOBAL.DATA : {}, 
							// globalDataVersion: GLOBAL.globalConstants.globalDataVersion,
							userData: GLOBAL.USERS[userId].userData, // data это все данные из кеша!! реализовать систему кешу!!
							userId: userId, 
							verifyHash: GLOBAL.USERS[userId].verifyHash, 
							autoConfigData: autoConfigData
						};
		}
		else{
			// Ответ что у мы не можем авторизоваться (не верные данные)
			console.log("NOT SUCH USER! INCORRECT REGISTRATION DATA!");
		}
		
		if(data.socket){
			var string_params = JSON.stringify({f: "authorizationResponse", p: sendData});
			var bytes_count = lib.return_bytes(string_params);
			data.socket.write(bytes_count+string_params);
		}
	}
	
	
	
	
	
	
	
	/**************** BATTLE ****************/
	
	
	/*
		* Description:
		*	function Создает битву
		*	
		*	@data: 	object, Data from client
		*	
		*
		* @since  31.01.15
		* @author pcemma
	*/
	this['battleCreate'] = function (data) {
		console.log(data);
		if(data){
			battlesManager.createBattle();
		
		}
	}
	
	
	/*
		* Description:
		*	function Проверяет про инфу о битве, в случае если битва идет добавляет игрока к битве 
		*				Если битва закончена то возвращает инфу о том что битвы такой нет.
		*	
		*	@data: 	object, Data from client
		*	
		*
		* @since  31.01.15
		* @author pcemma
	*/
	this['enterBattle'] = function (data) {
		console.log(data);
		if(data){
			battlesManager.enterBattle({id: data.id, user: GLOBAL.USERS[data.userId]});
		}
	}
	
	
	/*
		* Description:
		*	function Двигает героя
		*	
		*	@data: 	object, Data from client
		*		@battleId: 	int, ид боя
		*		@hexId: 	str, вида x.y
		*
		* @since  06.02.15
		* @author pcemma
	*/
	this['battleMoveHero'] = function (data) {
		console.log("\n battleMoveHero");
		console.log(data);
		if(data){
			battlesManager.moveHero(data);
		}
	}
	
	
	/*
		* Description:
		*	function Двигает героя
		*	
		*	@data: 	object, Data from client
		*		@battleId: 	int, ид боя
		*		@hexId: 	str, вида x.y
		*
		* @since  06.02.15
		* @author pcemma
	*/
	this['battleHeroMakeHit'] = function (data) {
		console.log("\n battleHeroMakeHit");
		console.log(data);
		if(data){
			battlesManager.heroMakeHit(data);
		}
	}
	
	

}

module.exports = Router;


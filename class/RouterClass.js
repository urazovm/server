console.log("Router CLASS is connected");	


function Router() {

}



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
Router.prototype.route = function(pathname, data) {
	console.log("pathname", pathname);
	if (typeof (this[pathname]) === 'function') {
		// data = JSON.parse(data);
		// console.log(data);
		// GLOBAL CHECKING IF USER EXIST AND VERIFYING
		if( pathname == 'getGlobalData' || pathname == 'authorization' || pathname == 'makeClientsErrorLogs' || ( GLOBAL.USERS[data.userId] && GLOBAL.USERS[data.userId].verifyHash == data.verifyHash)){
			this[pathname](data);
		}
	} else {
		console.log("No request handler found for " + pathname);
		this['/'](data);
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
Router.prototype['/'] = function (response, data) {
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
	* @since  26.07.15
	* @author pcemma
*/
Router.prototype.makeClientsErrorLogs = function (data) {
	console.log("data.error_message",data);
	data.userId = Number(data.userId);
	if(data.userId || data.userId === 0){
		// Добавить новую ошибку либо обновить статус у старой
		Mongo.findAndModify(	
			'game_ErrorsClientList', 
			{functionName: data.functionName}, 
			[],  
			{
				$set: { 
					functionName: data.functionName, 
					error: data.error
				},
				$inc: {count: 1}
			},
			{
				upsert: true,
				new: true
			},
			function(doc){
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
				Mongo.update('game_ErrorsClientList', {_id: doc.value._id}, insertData, function(){});
				
				// Занести в список ошибок (лист)
				Mongo.insert('game_ErrorsClient', {date: + new Date(), errorId: doc.value._id.toHexString(), clientVersion: data.clientVersion, userId: data.userId}, function(doc){});
			}
		);
	}
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
Router.prototype.removeUserFromServer = function (userId) {
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
Router.prototype.getGlobalData = function (data) {
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
Router.prototype.authorization = function (data) {
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
Router.prototype.battleCreate = function (data) {
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
Router.prototype.enterBattle = function (data) {
	if(data){
		battlesManager.enterBattle({id: data.id, user: GLOBAL.USERS[data.userId], battleType: data.battleType});
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
Router.prototype.battleMoveHero = function (data) {
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
Router.prototype.battleHeroMakeHit = function (data) {
	if(data){
		battlesManager.heroMakeHit(data);
	}
}
	
	
	
	
	

/**************** USER ****************/

/*
	* Description:
	*	function Надевает предмет на героя
	*	
	*	@data: 	object, Data from client
	*		@itemId: 	int, ид вещи из таблицы вещей пользователя
	*	
	*
	* @since  08.06.15
	* @author pcemma
*/
Router.prototype.userWearOnItem = function (data) {
	if(data){
		GLOBAL.USERS[data.userId].wearOnItem(data);
	}
}


/*
	* Description:
	*	function Снимает предмет с героя
	*	
	*	@data: 	object, Data from client
	*		@itemId: 	int, ид вещи из таблицы вещей пользователя
	*	
	*
	* @since  08.06.15
	* @author pcemma
*/
Router.prototype.userWearOffItem = function (data) {
	if(data){
		GLOBAL.USERS[data.userId].wearOffItem(data);
	}
}





module.exports = Router;


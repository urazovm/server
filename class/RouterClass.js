console.log("Router CLASS is connected");	

var GLOBAL 								= require("./PreloadDataClass"),
	UsersManager 						= require("./UsersManagerClass"),
	RedisRouterClientClass	= require("./RedisRouterClientClass"),
	ErrorHandlerClass 			= require("./ErrorHandlerClass"),
	errorHandler 						= new ErrorHandlerClass();
	redisRouter 						= new RedisRouterClientClass();

function Router() {

};



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
		// GLOBAL CHECKING IF USER EXIST AND VERIFYING
		if( pathname === 'getGlobalData' || 
				pathname === 'authorization' || 
				pathname === 'createNewAccount' || 
				pathname === 'makeClientsErrorLogs' || 
				UsersManager.isUserVerified(data.userId, data.verifyHash)) {

			this[pathname](data);
		}
	} else {
		console.log("No request handler found for " + pathname);
	}
};



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
	errorHandler.logClientError(data);
};




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
	GLOBAL.getGlobalData(data);
};



/**************** USER ****************/


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
	UsersManager.authorization(data);
};	
	

/*
	* Description:
	*	function that make new user account and auth
	*	
	*	@data: 	object, Data from client
	*	
	*
	* @since  20.06.16
	* @author pcemma
*/
Router.prototype.createNewAccount = function (data) {
	UsersManager.createNewAccount(data);
};	


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
	UsersManager.userWearOnItem(data);
};


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
	UsersManager.userWearOffItem(data);
};

	
	
	
	
	
	






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
/*
Router.prototype.battleCreate = function (data) {
	if(data){
		redisRouter.sendData("createBattle", data);
	}
}
*/


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
		redisRouter.sendData('enterBattle', data);
	}
};


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
		redisRouter.sendData('battleMoveHero', data);
	}
};


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
		redisRouter.sendData('battleHeroMakeHit', data);
	}
};
	

module.exports = Router;
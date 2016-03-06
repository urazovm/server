console.log("RedisRouterServerClass CLASS is connected");	

var redis = require('redis'),
	domain = require('domain'),
	ErrorHandlerClass = require("./ErrorHandlerClass.js"),
	battlesManager = require("./BattleManagerClass.js"),
	errorHandler = new ErrorHandlerClass();

function RedisRouterServerClass() {
	var redisDomain = domain.create().on('error', function(err) { errorHandler.logServerError(err); });
	this.redisSub = redis.createClient();
	this.channels = ['battle_server'];

	this.redisSub.subscribe('battle_server');
	this.redisSub.on("message", function (channel, message) {
	    var messageData = JSON.parse(message),
	    	funcName = messageData.f,
	    	data = messageData.p;
	    if (typeof (this[funcName]) === 'function') {
	    	this[funcName](data);
	    }	
	}.bind(this));

	redisDomain.add(this.redisSub);
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
RedisRouterServerClass.prototype.enterBattle = function (data) {
	if(data){
		battlesManager.enterBattle(data);
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
RedisRouterServerClass.prototype.battleMoveHero = function (data) {
	if(data){
		battlesManager.moveHero(data);
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
RedisRouterServerClass.prototype.battleHeroMakeHit = function (data) {
	if(data){
		battlesManager.heroMakeHit(data);
	}
};

module.exports = RedisRouterServerClass;
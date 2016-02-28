console.log("RedisRouterServerClass CLASS is connected");	

var redis = require('redis');

function RedisRouterServerClass() {
	// this.redisPub = redis.createClient();
	this.redisSub = redis.createClient();
	this.channels = ['battle_server'];

	this.redisSub.subscribe('battle_server');
	this.redisSub.on("message", function (channel, message) {
	    console.log(channel);
	    message = JSON.parse(message);
	    console.log(message);
	    // {f (funcName): str, p(params): data}
	    if (typeof (this[message.f]) === 'function') {
	    	console.log("sdfsdf");
	    	this[message.f](message.p);
	    }	
	}.bind(this));
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
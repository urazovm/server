console.log("RedisRouterClientClass CLASS is connected");	

var redis = require('redis');

function RedisRouterClientClass() {
	this.redisPub = redis.createClient();
	this.redisSub = redis.createClient();
	this.channels = ['battle_client'];

	this.redisSub.subscribe('battle_client');
	this.redisSub.on("message", function (channel, message) {
	    console.log(channel);
	    message = JSON.parse(message);
	    console.log(message);
	    // {f (funcName): str, p(params): data}
	    if (typeof (this[message.f]) === 'function') {
	    	this[message.f](message.p);
	    }	
	});
}


/*
	* Description:
	*	function Send data throw redis to battle server
	*		@f: str, method tocall in battle server
	*		@p: array
	*			@id: 			str, ид боя
	*
	* @since  28.02.16
	* @author pcemma
*/
RedisRouterClientClass.prototype.sendData = function(f, p) {
	var channel = "battle_server";
	console.log(f, p);
	this.redisPub.publish(channel, JSON.stringify({f: f, p: p}));
};


/*
	* Description:
	*
	* @since  28.02.16
	* @author pcemma
*/
RedisRouterClientClass.prototype.sendDataToUser = function(data) {
	var usersIdArr = data.usersIdArr;
	var data = data.data;
	for(var i in usersIdArr) {
		var userId = usersIdArr[i];
		if(userId in GLOBAL.USERS) {
			GLOBAL.USERS[userId].socketWrite(data);
		}
	}
};


module.exports = RedisRouterClientClass;
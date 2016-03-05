console.log("RedisRouterClientClass CLASS is connected");	

var redis = require('redis'),
	domain = require('domain'),
	ErrorHandlerClass = require("./ErrorHandlerClass.js"),
	errorHandler = new ErrorHandlerClass();
	

function RedisRouterClientClass() {
	var redisDomain = domain.create().on('error', function(err) { errorHandler.logServerError(err); });

	this.redisPub = redis.createClient();
	this.redisSub = redis.createClient();
	this.channels = ['battle_client'];

	this.redisSub.subscribe('battle_client');
	this.redisSub.on("message", function (channel, message) {
	    var messageData = JSON.parse(message),
	    	funcName = messageData.f,
	    	data = messageData.p;
	    if (typeof (this[funcName]) === 'function') {
	    	this[funcName](data);
	    }		
	}.bind(this));

	redisDomain.add(this.redisPub);
	redisDomain.add(this.redisSub);
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
	this.redisPub.publish(channel, JSON.stringify({f: f, p: p}));
};


/*
	* Description:
	*	Send data to user
	*	@data: obj
	*		@usersIdArr: 	arr, array of the users id.
	*		@data: 			obj, data to send to user.
	*
	*
	* @since  28.02.16
	* @author pcemma
*/
RedisRouterClientClass.prototype.sendDataToUser = function(data) {
	var usersIdArr = data.usersIdArr;
	var sendData = data.data;
	usersIdArr.forEach(function(userId, index, array){
		if(userId in GLOBAL.USERS) {
			GLOBAL.USERS[userId].socketWrite(sendData);
		}
	});
};


module.exports = RedisRouterClientClass;
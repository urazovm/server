console.log("RedisRouterClass CLASS is connected");	
var redis = require('redis');



function RedisRouterClass() {
	// var redisCli = redis.createClient();
	this.redisPub = redis.createClient();
	this.redisSub = redis.createClient();
	this.channels = ['battle'];

	this.redisSub.on("message", function (channel, message) {
	    console.log(channel);
	    console.log(message);
	    // {f (funcName): str, p(params): data}
	    if (typeof (this[f]) === 'function') {
	    	this[f](p);
	    }	
	});
}

RedisRouterClass.prototype.subscribe = function(channel) {
	this.redisSub.subscribe(channel);
}




RedisRouterClass.prototype.testFunc = function(data) {

}




module.exports = RedisRouterClass;
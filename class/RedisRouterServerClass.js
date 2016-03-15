console.log("RedisRouterServerClass CLASS is connected");	

var redis = require('redis'),
	domain = require('domain'),
	ErrorHandlerClass = require("./ErrorHandlerClass.js"),
	eventEmitter = require("./EventEmitterClass"),
	errorHandler = new ErrorHandlerClass();

function RedisRouterServerClass() {
	var redisDomain = domain.create().on('error', function(err) { errorHandler.logServerError(err); });
	this.redisSub = redis.createClient();
	this.channels = ['battle_server'];

	this.redisSub.subscribe('battle_server');
	this.redisSub.on("message", function (channel, message) {
    var messageData = JSON.parse(message),
    	listner = messageData.f,
    	data = messageData.p;
    eventEmitter.emit(listner, data);
	});

	redisDomain.add(this.redisSub);
}

module.exports = RedisRouterServerClass;
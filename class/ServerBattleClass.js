console.log("SERVER BATTLE CLASS is connected");	

var express = require('express'),
    http = require('http'),
    io = require('socket.io'),
	domain = require('domain'),
	RedisRouterServerClass = require("./RedisRouterServerClass.js"),
	ErrorHandlerClass = require("./ErrorHandlerClass.js"),
	errorHandler = new ErrorHandlerClass(),
	redisRouter = new RedisRouterServerClass();


function ServerBattleClass() {
	
}


/*
	* Description:
	*	Function start battle server
	*		
	*
	*
	*	return:
	*
	* @since  29.02.16
	* @author pcemma
*/
ServerBattleClass.prototype.start = function() {
	var app = express(),
		server = http.createServer(app); 
	
	app.use(function(req, res, next) {
	    var requestDomain = domain.create();
	    requestDomain.add(req);
	    requestDomain.add(res);
	    requestDomain.on('error', function(err) { errorHandler.logServerError(err); });
	});
	
	io.listen(server).listen(21090);
	
	console.log("\n\n -------------------------------------------------------------\n",
					"SERVER BATTLE START TIME:"+Date()+" \n",
					"client version: ", GLOBAL.globalConstants.clientVersion+" \n", 
					"Data version: ", GLOBAL.globalConstants.globalDataVersion+" \n",
					"-------------------------------------------------------------\n\n");
};


module.exports = ServerBattleClass;
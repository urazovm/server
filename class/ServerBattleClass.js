console.log("SERVER BATTLE CLASS is connected");	

var express = require('express'),
	http = require('http'),
	io = require('socket.io'),
	domain = require('domain'),
	async = require('async'),
	mongoose = require("mongoose"),

	// add personal config package
	config = require("./../config/personal_config.js"),

	Mongo = require("./MongoDBClass.js"),
	GLOBAL = require("./PreloadDataClass.js"),
	utils = require("./UtilsClass.js"),
	battlesManager = require("./BattleManagerClass.js"),

	RedisRouterServerClass = require("./RedisRouterServerClass.js"),
	ErrorHandlerClass = require("./ErrorHandlerClass.js"),
	errorHandler = new ErrorHandlerClass(),
	redisRouter = new RedisRouterServerClass();


function ServerBattleClass() {
	this.start();
};


ServerBattleClass.prototype.start = function() {
	
	mongoose.connect("mongodb://127.0.0.1/pcemmaDb");

	var queues = [
		Mongo.connect.bind(Mongo),
		GLOBAL.initialize.bind(GLOBAL),
		battlesManager.initialize.bind(battlesManager),
		this.startServer.bind(this)
	];

	async.waterfall(
		queues,
		function(err) {
			console.log("Battle Server is started!");
		}
	)
};


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
ServerBattleClass.prototype.startServer = function() {
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


module.exports = new ServerBattleClass();
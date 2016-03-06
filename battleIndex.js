// add personal config package
config = require("./config/personal_config.js");


// classes	
ServerBattleClass 	= require("./class/ServerBattleClass.js");
MongoDBClass 		= require("./class/MongoDBClass.js");
PreloadDataClass 	= require("./class/PreloadDataClass.js");



/************** 	START SERVER		********************/
Mongo = new MongoDBClass(function() {
	GLOBAL = new PreloadDataClass();
	GLOBAL.initialize(function() {
		var server = new ServerBattleClass();
		server.start();
	});
});
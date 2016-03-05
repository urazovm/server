// add personal config package
config = require("./config/personal_config.js");

// add lib package
lib =  require("./lib/lib.js"); 

// classes	
ServerBattleClass 	= require("./class/ServerBattleClass.js");
MongoDBClass 		= require("./class/MongoDBClass.js");
PreloadDataClass 	= require("./class/PreloadDataClass.js");
BattleManagerClass 	= require("./class/BattleManagerClass.js");


/************** 	START SERVER		********************/
Mongo = new MongoDBClass(function() {
	GLOBAL = new PreloadDataClass();
	GLOBAL.initialize(function() {
		battlesManager = new BattleManagerClass();
		var server = new ServerBattleClass();
		server.start();
	});
});
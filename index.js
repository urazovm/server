async = require("async");


// add personal config package
config = require("./config/personal_config.js");

// add lib package
lib =  require("./lib/lib.js"); 

// classes	
RouterClass 		= require("./class/RouterClass.js");
ServerClass 		= require("./class/ServerClass.js");
MongoDBClass 		= require("./class/MongoDBClass.js");
PreloadDataClass 	= require("./class/PreloadDataClass.js");
StatsManagerClass	= require("./class/StatsManagerClass.js");
ItemClass			= require("./class/ItemClass.js");
UserClass 			= require("./class/UserClass.js");
NpcClass 			= require("./class/NpcClass.js");
BattleManagerClass 	= require("./class/BattleManagerClass.js");
BattleClass			= require("./class/BattleClass.js");
GridClass			= require("./class/GridClass.js");
HexagonClass		= require("./class/HexagonClass.js");



/************** 	START SERVER		********************/
Mongo = new MongoDBClass(function() {
	GLOBAL = new PreloadDataClass();
	GLOBAL.initialize(function() {
		battlesManager = new BattleManagerClass();
		var server = new ServerClass();
		server.start();
	});
});
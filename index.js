async = require("async");


syncMysql = require("mysql-libmysqlclient");
asyncMysql = require('mysql');



// add personal config package
config = require("./config/personal_config.js");

// add lib package
lib =  require("./lib/lib.js"); 

// classes	
RouterClass 		= require("./class/RouterClass.js");
ServerClass 		= require("./class/ServerClass.js");
MongoDBClass 		= require("./class/MongoDBClass.js");
PreloadDataClass 	= require("./class/PreloadDataClass.js");
UserClass 			= require("./class/UserClass.js");
NpcClass 			= require("./class/NpcClass.js");
BattleManagerClass 	= require("./class/BattleManagerClass.js");
BattleClass			= require("./class/BattleClass.js");
HexagonClass		= require("./class/HexagonClass.js");



/************** 	OBJECTS		********************/

Mongo = new MongoDBClass(function(){
	GLOBAL = new PreloadDataClass();
	GLOBAL.initialize(function(){
		battlesManager = new BattleManagerClass();

		// start server
		var server = new ServerClass();
		server.start();
	});
});
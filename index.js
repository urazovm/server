// add personal config package
config = require("./config/personal_config.js");

// add lib package
lib =  require("./lib/lib.js"); 

// classes	
MongoDBClass 		= require("./class/MongoDBClass.js");
PreloadDataClass 	= require("./class/PreloadDataClass.js");
ServerClass 		= require("./class/ServerClass.js");




/************** 	START SERVER		********************/
Mongo = new MongoDBClass(function() {
	GLOBAL = new PreloadDataClass();
	GLOBAL.initialize(function() {
		var server = new ServerClass();
		server.start();
	});
});
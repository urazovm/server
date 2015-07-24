domain = require('domain');
net = require('net');
crypto = require('crypto');
geoip = require('./lib/geoip/geoip');
async = require("async");



var mongoose = require('mongoose');




syncMysql = require("mysql-libmysqlclient");
asyncMysql = require('mysql');



d = domain.create();


// add personal config package
config = require("./config/personal_config.js");
// mongoose.connect('mongodb://localhost/'+config.bd_config.bd_name);
mongoose.connect('mongodb://localhost/pcemmaDb');




// add lib package
lib =  require("./lib/lib.js"); 

// classes	
ServerClass 		= require("./class/ServerClass.js");
RouterClass 		= require("./class/RouterClass.js");
DbClass 			= require("./class/DBClass.js");
MongoDBClass 		= require("./class/MongoDBClass.js");
PreloadDataClass 	= require("./class/PreloadDataClass.js");
UserClass 			= require("./class/UserClass.js");
NpcClass 			= require("./class/NpcClass.js");


BattleManagerClass 	= require("./class/BattleManagerClass.js");
BattleClass			= require("./class/BattleClass.js");
HexagonClass		= require("./class/HexagonClass.js");



/************** 	OBJECTS		********************/


// start sql pool connection
SQL = new DbClass();
Mongo = new MongoDBClass(function(){
	GLOBAL = new PreloadDataClass();
	GLOBAL.initialize();
	
	battlesManager = new BattleManagerClass();


	// start server
	d.on('error', function(err) { lib.domainL(err); });
	d.run(function() {
		var server = new ServerClass();
		server.startSocket();	
		console.log("\n\n -------------------------------------------------------------\n",
					"SERVER START TIME:"+Date()+" \n",
					"client version: ", GLOBAL.globalConstants.clientVersion+" \n", 
					"Data version: ", GLOBAL.globalConstants.globalDataVersion+" \n",
					"-------------------------------------------------------------\n\n");
	});
});

// fill global data array
// GLOBAL = new PreloadDataClass();
// GLOBAL.initialize();



// battlesManager = new BattleManagerClass();


// start server
// d.on('error', function(err) { lib.domainL(err); });
// d.run(function() {
	// var server = new ServerClass();
	// server.startSocket();	
	// console.log("\n\n -------------------------------------------------------------\n",
				// "SERVER START TIME:"+Date()+" \n",
				// "client version: ", GLOBAL.globalConstants.clientVersion+" \n", 
				// "Data version: ", GLOBAL.globalConstants.globalDataVersion+" \n",
				// "-------------------------------------------------------------\n\n");
// });





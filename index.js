domain = require('domain');
net = require('net');
crypto = require('crypto');
geoip = require('./lib/geoip/geoip');

d = domain.create();
d.on('error', function(er) 
{
	console.log('### ERROR', er.stack);
	
	var find_error = false;
	
	for(var key in GLOBAL.errorsLists.serverErrorsList)
	{
		if(GLOBAL.errorsLists.serverErrorsList[key].error === er.stack)
		{
			if(GLOBAL.errorsLists.serverErrorsList[key].state == 1)
			{
				GLOBAL.errorsLists.serverErrorsList[key].state = 2;
				SQL.querySync("UPDATE `game_ErrorsServerList` SET `state` = 2 WHERE `id` = "+key);
			}
			
			find_error = true;
			break;
		}
	}
	if(!find_error)
	{
		var error_id = SQL.lastInsertIdSync("INSERT INTO `game_ErrorsServerList` SET `functionName` = '', `error` = '"+SQL.mysqlRealEscapeString(er.stack)+"', state = 0");
		var error_id = 1;
		GLOBAL.errorsLists.serverErrorsList[error_id] = {functionName: '', error: er.stack, state: 0};
	}

	SQL.querySync("INSERT INTO `game_ErrorsServer` SET `date` = UNIX_TIMESTAMP(), `functionName` = '', `error` = '"+SQL.mysqlRealEscapeString(er.stack)+"' ");

});


// add personal config package
config = require("./config/personal_config.js");

// add lib package
lib =  require("./lib/lib.js"); 

// classes	
ServerClass 		= require("./class/ServerClass.js");
RouterClass 		= require("./class/RouterClass.js");
DbClass 			= require("./class/DBClass.js");
PreloadDataClass 	= require("./class/PreloadDataClass.js");
UserClass 			= require("./class/UserClass.js");

BattleManagerClass 	= require("./class/BattleManagerClass.js");
BattleClass			= require("./class/BattleClass.js");
HexagonClass		= require("./class/HexagonClass.js");



/************** 	OBJECTS		********************/


// start sql pool connection
SQL = new DbClass();


// fill global data array
GLOBAL = new PreloadDataClass();
GLOBAL.initialize();


battlesManager = new BattleManagerClass();


// start server
d.run(function() {
	var server = new ServerClass();
	server.startSocket();	
	console.log("\n\n -------------------------------------------------------------\n",
				"SERVER START TIME:"+Date()+" \n",
				"client version: ", GLOBAL.globalConstants.clientVersion+" \n", 
				"Data version: ", GLOBAL.globalConstants.globalDataVersion+" \n",
				"-------------------------------------------------------------\n\n");
});






// var tempUser = new UserClass();
// tempUser.authOffline({userId: 181});



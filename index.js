domain = require('domain');
net = require('net');

d = domain.create();
d.on('error', function(er) 
{
	console.log('### ERROR', er.stack);
	er.stack = escape(er.stack);
	
	var find_error = false;
	//TODO add clientVersion
	// var client_version = (lib.clientsArr[user_id]) ? lib.clientsArr[user_id].client_version : "";
	
	for(var key in GLOBAL.errorsLists.serverErrorsList)
	{
		if(GLOBAL.errorsLists.serverErrorsList[key].error_message === er.stack)
		{
			if(GLOBAL.errorsLists.serverErrorsList[key].state == 1)
			{
				GLOBAL.errorsLists.serverErrorsList[key].state = 2;
				// SQL.querySync("UPDATE `game_ErrorsServerList` SET `state` = 2 WHERE `id` = "+key);
			}
			
			find_error = true;
			break;
		}
	}
	if(!find_error)
	{
		// var error_id = SQL.lastInsertIdSync("INSERT INTO `game_ErrorsServerList` SET `functionName` = '', `error` = '"+er.stack+"', state = 0");
		var error_id = 1;
		GLOBAL.errorsLists.serverErrorsList[error_id] = {functionName: '', error: er.stack, state: 0};
	}

	// SQL.querySync("INSERT INTO `game_ErrorsServer` SET `date` = UNIX_TIMESTAMP(), `functionName` = '', `error` = '"+er.stack+"' ");

});


// add personal config package
config = require("./config/personal_config.js");

// add lib package
lib =  require("./lib/lib.js"); 

// classes	
ServerClass = require("./class/ServerClass.js");
RouterClass = require("./class/RouterClass.js");
DbClass = require("./class/DBClass.js");
PreloadDataClass = require("./class/PreloadDataClass.js");
UserClass = require("./class/UserClass.js");



/************** 	OBJECTS		********************/


// start sql pool connection
SQL = new DbClass();


// fill global data array
GLOBAL = new PreloadDataClass();
GLOBAL.initialize();



// bot on server
// GLOBAL.USERS[1] = new UserClass();




// start server
d.run(function() {
	var server = new ServerClass();
	server.startHttp();
	server.startSocket();	
	console.log("\n\n -------------------------------------------------------------\n",
				"SERVER START TIME:"+Date()+" \n",
				"client version: ", GLOBAL.globalConstants.clientVersion+" \n", 
				"Data version: ", GLOBAL.globalConstants.globalDataVersion+" \n",
				"-------------------------------------------------------------\n\n");
});


// var tempUser = new UserClass();
// tempUser.authOffline({userId: 181});



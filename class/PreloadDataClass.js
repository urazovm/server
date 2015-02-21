console.log("PreloadData CLASS is connected");	
	
function PreloadDataClass() {


	this.initialize = function()
	{
		
		// create USERS array
		this.createGlobalUsers();
		
		// собираем все константы
		this.globalConstants = this.createGlobalConstants();
	
		// create DATA array
		this.createGlobalData();
		
		//собираем массив ошибок
		this.errorsLists = this.getErrorsLists();
	}






	/**************** DATA ARRAY FUNCTIONS ************/	
	
	/*
		* Description:
		*	Create the Global data array and fill it.
		*	
		*	
		*	
		*
		* @since  10.02.14
		* @author pcemma
	*/
	this.createGlobalData = function()
	{
		this.DATA = {};
		
		// help array only for server
		this.HELP = {};
		
		
		this.DATA.stats = this.getStats();
		console.log(this.DATA.stats);
		
		
		this.DATA.items = this.getItems();
		
		
		
		
		this.DATA.battleInfo = this.getBattleInfo();;
		
		
		
		console.log(this.DATA.battleInfo);
	}
	
	
	/*
		* Description:
		*	Собирает список предметов (данные о предметах)
		*	
		*	
		*	
		*
		* @since  22.12.14
		* @author pcemma
	*/
	this.getItems = function()
	{
		var items = {};
		var req = SQL.querySync("SELECT `game_Items`.* "+
								"FROM `game_Items`");
		
		
		var rows = req.fetchAllSync();
		for (var i=0, length = rows.length - 1; i <= length; i += 1){
			items[String(rows[i].id)] = {
											id: String(rows[i].id),
											name: rows[i].name,
											weight: rows[i].weight,
											imageId: rows[i].imageId,
											recipe: (rows[i].receipId) ? rows[i].receipId : null,
											categories: rows[i].category.split(","),
											needStats: {},
											giveStats:{},
											attachments: {},
											
										};
		}
		
		return items;
	}
	
	
	
	
	
	/*
		* Description:
		*	Собирает список всех статов в игре, которые могут быть у предметов, игроков и прочее
		*	
		*	
		*	
		*
		* @since  21.02.15
		* @author pcemma
	*/
	this.getStats = function()
	{
		var stats = {};
		var req = SQL.querySync("SELECT `game_Stats`.* FROM `game_Stats`");
		
		
		var rows = req.fetchAllSync();
		for (var i=0, length = rows.length - 1; i <= length; i += 1){
			stats[rows[i].name] = {
											id: String(rows[i].id),
											order: 0,
											group: 0
									};
		}
		
		return stats;
	}
	
	
	
	
	
	
	
	
	
	
	/**************** BATTLE INFO ************/	
	
	/*
		* Description:
		*	Инфа по бивте
		*		Объеты на поле боя (препятствия)
		*	
		*	
		*
		* @since  08.02.15
		* @author pcemma
	*/
	this.getBattleInfo = function()
	{
		var battleInfo = {};
			battleInfo.obstructions = this.getBattleObstructions();
		
		return battleInfo;
	}
	
	
	/*
		* Description:
		*	Собирает инфу о препятсвиях на поле боя
		*	
		*	
		*
		* @since  08.02.15
		* @author pcemma
	*/
	this.getBattleObstructions = function()
	{
		var obstructions = {};
		var req = SQL.querySync("SELECT * FROM  `game_BattleObstructions`");
		var row = req.fetchAllSync();
		for(key in row)
		{
			obstructions[String(row[key].id)] = row[key];
		}
		return obstructions;
	}
	
	
	
	
	
	
	
	
	
	/**************** USERS ************/

	/*
		* Description:
		*	Create the Global users array
		*	
		*	
		*	
		*
		* @since  10.02.14
		* @author pcemma
	*/
	this.createGlobalUsers = function()
	{
		// GLOBAL USERS ARRAY
		this.USERS = {};
		var usersCountRow = SQL.querySync("SELECT `id` FROM `game_Users`");
		var users = usersCountRow.fetchAllSync();
		
		for (var key in users){
			console.log(users[key].id);
			this.USERS[users[key].id] = new UserClass();
			this.USERS[users[key].id].getUserData(users[key].id);
			
		}
		
		
	}
	
	
	
	
	
	

	
	
	
	
	

	
	/*****************	CONTSTANTS	*********************/
	
	
	
	/*
		* @Description:
		*	
		*	
		*	
		* @return: 
		*
		*
		* @since  31.03.14
		* @author pcemma	
	*/
	this.createGlobalConstants = function(id)
	{
		var constants = {};
		var req = SQL.querySync("SELECT * FROM  `game_GlobalConstants`");
		var row = req.fetchAllSync();
		
		for(key in row)
		{
			// get client version
			if(row[key].name == "clientVersion")
				constants.clientVersion = lib.explode( ".", row[0].value );
			else
				constants[row[key].name] = Number(row[key].value);
		}
		
		return constants;
	}
	
		
	/*
		* @Description:
		*	
		*	Function that compare 2 strings of versions
		*	
		*	
		*	version: string that we must find
		*	need_version: compare with (by default lib.current_server_version)
		*	
		* @return: 
		*
		*
		* @since  31.03.14
		* @author pcemma	
	*/

	this.checkVersion = function(version, need_version)
	{
		if(!need_version) 
			need_version = this.globalConstants.clientVersion;
		else
			need_version = lib.explode( ".", need_version );
			
		if(version && version != '')
		{
			var client_version = lib.explode( ".", version );
			for(var key in need_version)
			{
				if(Number(client_version[key]) > Number(need_version[key]))
					return true;
				if(Number(client_version[key]) < Number(need_version[key]))
					return false;
			}
		}
		return true;
	}
	
		
	/*
		function that get errors lists from db
		
		author: pcemma
		
		return array
		[
			clients_errors_list: array (clients_errors_list[id] = array(functionName, error, state))
			server_errors_list: 	array (server_errors_list[id] = array(functionName, error, state))
		]
	*/
	this.getErrorsLists = function()
	{
		var exports = {}
		exports.clientsErrorsList = {};
		exports.serverErrorsList = {};
		
		// clients errors
		var req = SQL.querySync("SELECT * FROM  `game_ErrorsClientList` ");
		var row = req.fetchAllSync();
		for(key in row)
			exports.clientsErrorsList[row[key].id] = {functionName: row[key].functionName, error: row[key].error, state: row[key].state, clientVersion: row[key].clientVersion};
		
		var req = SQL.querySync("SELECT * FROM  `game_ErrorsServerList` ");
		var row = req.fetchAllSync();
		for(key in row)
			exports.serverErrorsList[row[key].id] = {functionName: row[key].functionName, error: row[key].error, state: row[key].state, clientVersion: row[key].clientVersion};
		
		return exports;
	}
	
	

	
}
module.exports = PreloadDataClass;
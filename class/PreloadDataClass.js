console.log("PreloadData CLASS is connected");	
	
function PreloadDataClass() {


	this.initialize = function()
	{
		
		// собираем все константы
		this.globalConstants = this.createGlobalConstants();
		
		// create DATA array
		this.createGlobalData();
		
		
		// create USERS array
		this.createGlobalUsers();
		
		
		// create NPC array
		// this.createGlobalNpcs();
		
		
		
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
	
	
		this.DATA.items = this.getItems();
		this.DATA.spineSlots = this.getSpineSlots();
		this.DATA.inventorySlots = this.getInventorySlots();
		
		
		
		this.DATA.battleInfo = this.getBattleInfo();
		
		
		
		this.DATA.NpcsInfo = this.getNpcsInfo();
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
		var req = SQL.querySync("SELECT "+
									"`game_Items` . *, "+
									"`game_ItemsStats`.`statId`, "+
									"`game_ItemsStats`.`value` AS `statValue`, "+
									"`game_Stats`.`name` AS  `statName`, "+
									"`game_ItemsAttachments`.`slotSpineId`, "+
									"`game_ItemsAttachments`.`attachmentSpineId` "+
								"FROM "+
									"(`game_Items`) "+
								"LEFT JOIN `game_ItemsStats` ON `game_Items`.`id` = `game_ItemsStats`.`itemId` "+
								"LEFT JOIN `game_Stats`ON  `game_ItemsStats`.`statId`  = `game_Stats`.`id` "+
								"LEFT JOIN `game_ItemsAttachments`ON `game_Items`.`id` = `game_ItemsAttachments`.`itemId` "+
								"WHERE 1 ");
		
		
		var rows = req.fetchAllSync();
		for (var i=0, length = rows.length - 1; i <= length; i += 1){
			// Проверяем добавляли ли мы уже такой итем.если да, то смотрим какое из свойств еще не добавленно
			var itemId = String(rows[i].id);
			if(!items[itemId]){
				items[itemId] = {
											id: String(rows[i].id),
											name: rows[i].name,
											imageId: rows[i].imageId,
											rarity: rows[i].rarity,
											// recipe: (rows[i].receipId) ? rows[i].receipId : null,
											categories: rows[i].category.split(","),
											// needStats: {},
											stats:{},
											attachments: {},
										};
			}
			
			// Собираем статы вещи, которые она дает
			if(rows[i].statName && items[itemId] && !items[itemId].stats[rows[i].statName]){
				items[itemId].stats[rows[i].statName] = rows[i].statValue;
			}
			
			// Собираем attachments вещи
			if(rows[i].slotSpineId && items[itemId] && !items[itemId].attachments[String(rows[i].slotSpineId)]){
				items[itemId].attachments[String(rows[i].slotSpineId)] = rows[i].attachmentSpineId;
			}
		}
		console.log(items);
		return items;
	}
	
	
	/*
		* Description:
		*	Собирает список всех слотов для спайна
		*	
		*	
		*	
		*
		* @since  26.03.15
		* @author pcemma
	*/
	this.getSpineSlots = function()
	{
		var spineSlots = {},
			req = SQL.querySync("SELECT `game_ItemsSpineSlots`.* FROM `game_ItemsSpineSlots`"),
			rows = req.fetchAllSync();
		for (var i=0, length = rows.length - 1; i <= length; i += 1){
			spineSlots[String(rows[i].id)] = {
											id: String(rows[i].id),
											name: rows[i].name
									};
		}
		return spineSlots;
	}
	
	
	/*
		* Description:
		*	Собирает список всех слотов инвентаря
		*	
		*	
		*	
		*
		* @since  03.04.15
		* @author pcemma
	*/
	this.getInventorySlots = function()
	{
		var invetorySlots = {},
			req = SQL.querySync("SELECT `game_ItemsInventorySlots`.* FROM `game_ItemsInventorySlots`"),
			rows = req.fetchAllSync();
		for (var i=0, length = rows.length - 1; i <= length; i += 1){
			invetorySlots[String(rows[i].id)] = {
											id: String(rows[i].id),
											imageId: String(rows[i].imageId),
											order: String(rows[i].order)
									};
		}
		return invetorySlots;
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
		*	Информация о всех нпц
		*	
		*	
		*
		* @since  05.05.15
		* @author pcemma
	*/
	this.getNpcsInfo = function()
	{
		var npcsInfo = {},
			npcsInfoReq = SQL.querySync("SELECT `game_Npcs`.* FROM `game_Npcs`"),
			rows = npcsInfoReq.fetchAllSync();
		for (var npcId in rows){
			npcsInfo[String(rows[npcId].id)] = {
												id: String(rows[npcId].id),
												name: rows[npcId].name,
												enName: rows[npcId].enName,
												ruName: rows[npcId].ruName,
												stats: {}
											};
			
			var reqStats = SQL.querySync("SELECT `ns`.*, `gs`.`name` "+
							"FROM `game_NpcsStats` `ns`, `game_Stats` `gs` "+
							"WHERE `ns`.`npcId` = "+rows[npcId].id+" AND `gs`.`id` = `ns`.`statId`"),
				statsRows = reqStats.fetchAllSync();
			
			for (var statId in statsRows){
				npcsInfo[String(rows[npcId].id)].stats[statsRows[statId].name] = statsRows[statId].value;
			}
			
		}
		
		console.log(npcsInfo);
		return npcsInfo;
	}
	
	
	
	/*
		* Description:
		*	Создает глобальный массив всех нпц на карте!
		*	
		*	
		*	
		*
		* @since  05.05.14
		* @author pcemma
	*/
	this.createGlobalNpcs = function()
	{
		var npcId = 1;
		
		// GLOBAL USERS ARRAY
		this.NPCS = {};
		
		
		
		for (var key in this.DATA.npcsInfo){
			for (var i = 1; i <= 10000; i++){
				this.NPCS[String(npcId)] = new NpcClass();
				this.NPCS[String(npcId)].getUserData(users[key].id);
				npcId++;
			}
		}
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
		var battleInfo = {
			obstructions: this.getBattleObstructions() // массив данных про препятсвия на карте боя
		};
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
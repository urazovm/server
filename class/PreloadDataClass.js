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
		this.createGlobalNpcs();
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
		
		var queues = [
			this.getTownsList.bind(this)
		];
		
		this.DATA = {};
		// help array only for server
		this.HELP = {};
		
		
		async.parallel(
			queues,
			function(err){
				// All tasks are done now
				console.log("ALL DONE!!!");
			}
		);
		
		
		
		
		
		
		
		
		this.DATA.stats = this.getStats();
	
	
		this.DATA.items = this.getItems();
		this.DATA.spineSlots = this.getSpineSlots();
		this.DATA.inventorySlotsList = this.getInventorySlotsList();
		
		
	
	
		
		
		this.DATA.battleInfo = this.getBattleInfo();
		
		
		// NPC INFO
		this.DATA.npcsInfo = this.getNpcsInfo();
		
		
		
		
		// TOWNS 
		// this.DATA.towns = this.getTownsList();
		this.DATA.buildingsTypes = this.getTownBuildingsTypes();
		this.DATA.buildings = this.getTownBuildingsList();
	}
	
	
	
	
	/*****************	TOWNS	**************/
	
	/*
		* Description:
		*	Собирает список городов
		*	
		*	
		*	
		*
		* @since  21.07.15
		* @author pcemma
	*/
	this.getTownsList = function(callback)
	{
		this.DATA.towns = {};
		Mongo.find('game_Towns', {}, function (rows) {
			for(var i in rows){
				rows[i].id = String(rows[i].id);
				this.DATA.towns[rows[i].id] = {
					id: rows[i].id,
					ruName: rows[i].ruName,
					enName: rows[i].enName
				};
			}
			callback();
		}.bind(this));
	}
	
	
	/*
		* Description:
		*	Собирает список типов зданий вгороде
		*	
		*	
		*	
		*	
		*
		* @since  17.06.15
		* @author pcemma
	*/
	this.getTownBuildingsTypes = function()
	{
		var townsBuildingsTypes = {},
			req = SQL.querySync("SELECT `game_TownsBuildingsTypes`.* FROM (`game_TownsBuildingsTypes`) "),
			rows = req.fetchAllSync();
		for (var i=0, length = rows.length - 1; i <= length; i += 1){
			rows[i].id = String(rows[i].id);
			townsBuildingsTypes[rows[i].id] = rows[i];
		}
		// console.log(townsBuildingsTypes);
		return townsBuildingsTypes;
	}
	
	
	/*
		* Description:
		*	Собирает список зданийв городах
		*	
		*	
		*	
		*
		* @since  14.06.15
		* @author pcemma
	*/
	this.getTownBuildingsList = function()
	{
		var buildings = {},
			req = SQL.querySync("SELECT `game_TownsBuildings`.* FROM (`game_TownsBuildings`) "),
			rows = req.fetchAllSync();
		for (var i=0, length = rows.length - 1; i <= length; i += 1){
			rows[i].id = String(rows[i].id);
			rows[i].townId = String(rows[i].townId);
			buildings[rows[i].id] = rows[i];
		}
		// console.log(buildings);
		return buildings;
	}
	
	
	
	/*****************	ITEMS	**************/
	
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
									"`game_ItemsAttachments`.`attachmentSpineId`, "+
									"`game_ItemsInventorySlots`.`slotId` "+
								"FROM "+
									"(`game_Items`) "+
								"LEFT JOIN `game_ItemsStats` ON `game_Items`.`id` = `game_ItemsStats`.`itemId` "+
								"LEFT JOIN `game_Stats` ON  `game_ItemsStats`.`statId`  = `game_Stats`.`id` "+
								"LEFT JOIN `game_ItemsAttachments` ON `game_Items`.`id` = `game_ItemsAttachments`.`itemId` "+
								"LEFT JOIN `game_ItemsInventorySlots` ON `game_Items`.`id` = `game_ItemsInventorySlots`.`itemId` "+
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
											inventorySlots: {},
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
			
			// Собираем слоты вещи, в которые она надевается
			if(rows[i].slotId && items[itemId] && !items[itemId].inventorySlots[String(rows[i].slotId)]){
				items[itemId].inventorySlots[String(rows[i].slotId)] = String(rows[i].slotId);
			}
		}
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
	this.getInventorySlotsList = function()
	{
		var invetorySlots = {},
			req = SQL.querySync("SELECT `game_ItemsInventorySlotsList`.* FROM `game_ItemsInventorySlotsList`"),
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
	
	
	
	
	
	
	
	
	
	
	/**************** NPCS ************/	
	
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
		var npcCount = 1;
		
		// GLOBAL NPC ARRAY
		this.NPCS = {};
		
		
		for (var realNpcId in this.DATA.npcsInfo){
			for (var i = 1; i <= 10; i++){
				var npcId = "npc"+npcCount;
				this.NPCS[String(npcId)] = new NpcClass();
				this.NPCS[String(npcId)].getUserData({npcId: realNpcId, userId: npcId});
				npcCount++;
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
	
	
	
	
	/**************** OTHERS ************/	
	
	
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
	

}
module.exports = PreloadDataClass;
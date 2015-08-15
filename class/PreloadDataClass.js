console.log("PreloadData CLASS is connected");	


function PreloadDataClass() {
	// this.initialize();
	this.DATA = {};
	this.USERS = {};
	
	return this;
}


PreloadDataClass.prototype.initialize = function(callback)
{
	var queues = [
		this.createGlobalConstants.bind(this), // собираем все константы
		
		// create DATA array
		// TOWNS 
		this.getTownsList.bind(this),
		this.getTownBuildingsTypes.bind(this),
		this.getTownBuildingsList.bind(this),
		
		this.getStats.bind(this),
		
		this.getBattleInfo.bind(this),
		
		// ITEMS
		this.getInventorySlotsList.bind(this),
		this.getSpineSlots.bind(this),
		this.getItems.bind(this),
		
		// NPC INFO
		this.getNpcsInfo.bind(this),
		
		// this.createGlobalUsers.bind(this), // create USERS array
		this.createGlobalNpcs.bind(this) // create NPC array
	];

	async.waterfall(
		queues,
		function(err){
			// All tasks are done now
			// console.log(this.DATA.items[1]);
			// console.log(this.DATA.battleInfo);
			console.log("PreloadDataClass is initialized!!!");
			callback();
		}.bind(this)
	)
}






/**************** DATA ARRAY FUNCTIONS ************/	


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
PreloadDataClass.prototype.getTownsList = function(callback)
{
	this.DATA.towns = {};
	Mongo.find('game_Towns', {}, {}, function (rows) {
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
PreloadDataClass.prototype.getTownBuildingsTypes = function(callback)
{
	this.DATA.buildingsTypes = {};
	Mongo.find('game_TownsBuildingsTypes', {}, {}, function(rows){
		for(var i in rows){
			rows[i].id = String(rows[i].id);
			this.DATA.buildingsTypes[rows[i].id] = {
				id: rows[i].id,
				name: rows[i].name
			};
		}
		callback();
	}.bind(this));
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
PreloadDataClass.prototype.getTownBuildingsList = function(callback)
{
		
	this.DATA.buildings = {};
	Mongo.find('game_TownsBuildings', {}, {}, function(rows){
		for(var i in rows){
			rows[i].id = String(rows[i].id);
			rows[i].townId = String(rows[i].townId);
			this.DATA.buildings[rows[i].id] = rows[i];
		}
		callback();
	}.bind(this));	
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
PreloadDataClass.prototype.getItems = function(callback)
{
	this.DATA.items = {};
	Mongo.find('game_Items', {}, {}, function (rows) {
		for(var i in rows){
			rows[i]._id = rows[i]._id.toHexString();
			this.DATA.items[rows[i]._id] = rows[i];
		}
		callback();
	}.bind(this));
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
PreloadDataClass.prototype.getSpineSlots = function(callback)
{
	this.DATA.spineSlots = {};
	Mongo.find('game_ItemsSpineSlots', {}, {}, function (rows) {
		for(var i in rows){
			this.DATA.spineSlots[String(rows[i].id)] = {
															id: String(rows[i].id),
															name: rows[i].name
														};
		}
		callback();
	}.bind(this));
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
PreloadDataClass.prototype.getInventorySlotsList = function(callback)
{
	this.DATA.inventorySlotsList = {};
	Mongo.find('game_ItemsInventorySlotsList', {}, {}, function (rows) {
		for(var i in rows){
			this.DATA.inventorySlotsList[String(rows[i].id)] = {
																	id: String(rows[i].id),
																	imageId: String(rows[i].imageId),
																	order: String(rows[i].order)
																};
		}
		callback();
	}.bind(this));
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
PreloadDataClass.prototype.getNpcsInfo = function(callback)
{
	this.DATA.npcsInfo = {};
	Mongo.find('game_NpcsInfo', {}, {}, function (rows) {
		for(var i in rows){
			this.DATA.npcsInfo[rows[i]._id] = rows[i];
		}
		callback();
	}.bind(this));
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
PreloadDataClass.prototype.createGlobalNpcs = function(callback)
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
	callback();
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
PreloadDataClass.prototype.getBattleInfo = function(callback)
{
	this.DATA.battleInfo = {};
	Mongo.find('game_BattleInfo', {}, {}, function (rows) {
		this.DATA.battleInfo = rows[0];
		callback();
	}.bind(this));
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
PreloadDataClass.prototype.getStats = function(callback)
{	
	this.DATA.stats = {};
	Mongo.find('game_Stats', {}, {}, function (rows) {
		for(var i in rows){
			rows[i].id = String(rows[i].id);
			this.DATA.stats[rows[i].name] = rows[i];
		}
		callback();
	}.bind(this));
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
/*
PreloadDataClass.prototype.createGlobalUsers = function(callback)
{
	// GLOBAL USERS ARRAY
	this.USERS = {};
	var usersCountRow = SQL.querySync("SELECT `id` FROM `game_Users`");
	var users = usersCountRow.fetchAllSync();
	
	for (var key in users){
		this.USERS[users[key].id] = new UserClass();
		this.USERS[users[key].id].getUserData(users[key].id);
	}
	callback();
}
*/













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
PreloadDataClass.prototype.createGlobalConstants = function(callback)
{
	
	this.globalConstants = {};
	Mongo.find('game_GlobalConstants', {}, {}, function (rows) {
		for(var i in rows){
			// get client version
			if(rows[i].name == "clientVersion"){
				rows[i].value = rows[i].value.split(".");
			}
			this.globalConstants[rows[i].name] = rows[i].value;
		}
		callback();
	}.bind(this));
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
PreloadDataClass.prototype.checkVersion = function(version, need_version)
{
	if(!need_version){ 
		need_version = this.globalConstants.clientVersion;
	}else{
		need_version = need_version.split(".");
	}	
	if(version && version != '')
	{
		var client_version = version.split(".");
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



module.exports = PreloadDataClass;
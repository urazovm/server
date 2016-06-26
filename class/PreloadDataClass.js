console.log("PreloadData CLASS is connected");	

require("../models/TownsModel");
require("../models/TownsBuildingsModel");
require("../models/TownsBuildingsTypesModel");

require("../models/StatsModel");
require("../models/HeroLevelsModel");
require("../models/InventorySlotsListModel");
require("../models/ItemsSpineSlotsModel");

require("../models/ItemsModel");


require("../models/HeroClassesModel");
require("../models/UsersModel");


require("../models/WorldItemsModel");


require("../models/ShotsInfoModel");
require("../models/GlobalConstantsModel");
require("../models/BattleObstructionsModel");
require("../models/InfoBattlesModel");





var async = require("async"),
	mongoose = require("mongoose"),

	

	Mongo = require("./MongoDBClass.js"),
	utils = require("./UtilsClass.js");

function PreloadDataClass() {
	this.DATA = {};
};


PreloadDataClass.prototype.initialize = function(callback) {
	var queues = [
		this.createGlobalConstants.bind(this), // собираем все константы
		
		// create DATA array
		// TOWNS 
		this.getTownsList.bind(this),
		this.getTownBuildingsTypes.bind(this),
		
		//OTHERS
		this.getStats.bind(this),
		this.getHeroClasses.bind(this),
		this.getHeroLevels.bind(this),

		//BATTLE
		this.getBattleObstructions.bind(this),
		this.getBattleInfo.bind(this),
		this.getShotsInfo.bind(this),
		
		// ITEMS
		this.getInventorySlotsList.bind(this),
		this.getSpineSlots.bind(this),
		this.getItems.bind(this),
		
		// NPC INFO
		this.getNpcsInfo.bind(this),
		// this.fillNpcsCollectionWithData.bind(this), // Функцию надо запустить для создания коллекции всех нпц в игровом мире
		// this.createGlobalNpcs.bind(this) // create NPC array
	];

	async.waterfall(
		queues,
		function(err) {
			// All tasks are done now
			console.log("GLOBAL is initialized!!!");
			console.log(this.DATA.battleInfo);
			callback();
		}.bind(this)
	)
};


/*
	* Description:
	*	function Check data version from user, return new data array if need
	*	
	*	@data: 	object, Data from client
	*		@socket: 	socket object, client socket to send data to. 
	*	
	* @since  07.03.16
	* @author pcemma
*/
PreloadDataClass.prototype.getGlobalData = function(data) {
	// SEND DATA TO CLIENT
	var sendData =  {
		// проверяем версию Данных
		globalData: (Number(data.globalDataVersion) !== Number(this.globalConstants.globalDataVersion) || _DEBUG) ? this.DATA : {}, 
		globalDataVersion: this.globalConstants.globalDataVersion
	};
	if(data.socket){
		data.socket.empty_connection = false;
		clearTimeout(data.socket.timer_for_off_empty_socket);
		var string_params = JSON.stringify({f: "getGlobalDataResponse", p: sendData});
		var bytes_count = utils.return_bytes(string_params);
		data.socket.write(bytes_count+string_params);
	}
};




/**************** DATA ARRAY FUNCTIONS ************/	


/*****************	TOWNS	**************/

/*
	* Description:
	*	Get all towns
	*	
	*	@callback: func, call back function
	*
	* @since  21.07.15
	* @author pcemma
*/
PreloadDataClass.prototype.getTownsList = function (callback) {
	this.DATA.towns = {};
	mongoose.model('game_towns').getAll(function(towns) {
		this.DATA.towns = towns;
		callback();
	}.bind(this));
};


/*
	* Description:
	*	Get all town buildings types
	*	
	*	@callback: func, call back function
	*
	* @since  17.06.15
	* @author pcemma
*/
PreloadDataClass.prototype.getTownBuildingsTypes = function(callback) {
	this.DATA.buildingsTypes = {};
	mongoose.model('game_townsBuildingsTypes').getAll(function(types) {
		this.DATA.buildingsTypes = types;
		callback();
	}.bind(this));
};






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
PreloadDataClass.prototype.getItems = function(callback) {
	this.DATA.items = {};
	mongoose.model('game_items').getAll(function(items) {
		this.DATA.items = items;
		callback();
	}.bind(this));
};


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
PreloadDataClass.prototype.getSpineSlots = function(callback) {
	this.DATA.spineSlots = {};
	mongoose.model('game_itemsSpineSlots').getAll(function(spineSlots) {
		this.DATA.spineSlots = spineSlots;
		callback();
	}.bind(this));
};


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
PreloadDataClass.prototype.getInventorySlotsList = function(callback) {
	this.DATA.inventorySlotsList = {};
	mongoose.model('game_inventorySlotsList').getAll(function(inventorySlotsList) {
		this.DATA.inventorySlotsList = inventorySlotsList;
		callback();
	}.bind(this));
};


/*
	* Description:
	*	Проверяет есть ли такая вещь вообще в базе
	*	
	*	@itemId: str, ид вещи в таблице game_Items
	*	
	*
	* @since  20.09.15
	* @author pcemma
*/
PreloadDataClass.prototype.isItemExist = function(itemId) {
	return (itemId in this.DATA.items);
};








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
PreloadDataClass.prototype.getNpcsInfo = function(callback) {
	this.DATA.npcsInfo = {};
	Mongo.find({collection: 'game_NpcsInfo', callback: function(rows) {
		for(var i in rows) {
			this.DATA.npcsInfo[rows[i]._id] = rows[i];
		}
		callback();
	}.bind(this)});
};


/*
	* Description:
	*	Заполняет коллекцию нпц полным списком нпц которые находятся в игровом мире.
	*	
	*	
	*	
	*
	* @since  16.08.15
	* @author pcemma
*/
/*
PreloadDataClass.prototype.fillNpcsCollectionWithData = function(callback) {
	for(var npcId in this.DATA.npcsInfo) {
		for(var count = 1; count <= this.DATA.npcsInfo[npcId].count; count++) {
			var newNpc = new NpcClass();
			newNpc.createNewUser({npcId: npcId}, callback);
		}
	}
};
*/




/**************** BATTLE ************/	


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
PreloadDataClass.prototype.getBattleObstructions = function(callback) {
	this.DATA.battleObstructions = {};
	mongoose.model('game_battleObstructions').getAll(function(battleObstructions){
		this.DATA.battleObstructions = battleObstructions;
		callback();
	}.bind(this));
};


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
PreloadDataClass.prototype.getBattleInfo = function(callback) {
	this.DATA.battleInfo = {};
	mongoose.model('game_infoBattles').getAll(function(battleInfo) {
		this.DATA.battleInfo = battleInfo;
		callback();
	}.bind(this));
	// Mongo.find({collection: 'game_BattleInfo', callback: function(rows) {
	// 	this.DATA.battleInfo = rows[0];
	// 	callback();
	// }.bind(this)});
};


/*
	* Description:
	*	Shots info
	*	
	*	
	*
	* @since  30.05.16
	* @author pcemma
*/
PreloadDataClass.prototype.getShotsInfo = function(callback) {
	this.DATA.shotsInfo = {};
	mongoose.model("game_shots").getAll(function(shotsInfo){
		this.DATA.shotsInfo = shotsInfo;
		callback();
	}.bind(this));
};





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
PreloadDataClass.prototype.getStats = function(callback) {	
	this.DATA.stats = {};
	mongoose.model('game_stats').getAll(function(stats) {
		this.DATA.stats = stats;
		callback();
	}.bind(this));
};


/*
	* Description:
	*	Собирает список классов героя. Со стандартными параметрами.
	*	
	*	
	*	
	*
	* @since  18.09.15
	* @author pcemma
*/
PreloadDataClass.prototype.getHeroClasses = function(callback) {	
	this.DATA.heroClasses = {};
	mongoose.model('game_heroClasses').getAll(function(heroClasses) {
		this.DATA.heroClasses = heroClasses;
		callback();
	}.bind(this));
};


/*
	* Description:
	*	Get list of levels
	*	
	*
	* @since  30.04.16
	* @author pcemma
*/
PreloadDataClass.prototype.getHeroLevels = function(callback) {	
	this.DATA.heroLevels = {};
	mongoose.model('game_heroLevels').getAll(function(heroLevels) {
		this.DATA.heroLevels = heroLevels;
		callback();
	}.bind(this));
};






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
PreloadDataClass.prototype.createGlobalConstants = function(callback) {
	this.globalConstants = {};
	mongoose.model('game_globalConstants').getAll(function(globalConstants){
		this.globalConstants = globalConstants;
		callback();
	}.bind(this));
};




	
/*
	* @Description:
	*	
	*	Function that compare 2 strings of versions
	*	
	*	
	*	version: string that we must find
	*	need_version: compare with (by default current_server_version)
	*	
	* @return: 
	*
	*
	* @since  31.03.14
	* @author pcemma	
*/
PreloadDataClass.prototype.checkVersion = function(version, need_version) {
	if(!need_version) {
		need_version = this.globalConstants.clientVersion;
	} 
	else {
		need_version = need_version.split(".");
	}	
	if(version && version !== '') {
		var client_version = version.split(".");
		for(var key in need_version) {
			if(Number(client_version[key]) > Number(need_version[key])) {
				return true;
			}
			if(Number(client_version[key]) < Number(need_version[key])) {
				return false;
			}
		}
	}
	return true;
};



module.exports = new PreloadDataClass();
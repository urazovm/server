console.log("PreloadData CLASS is connected");	


function PreloadDataClass() {
	// this.initialize();
	this.DATA = {};
	this.USERS = {};
	
	return this;
}


PreloadDataClass.prototype.initialize = function(callback) {
	var queues = [
		this.createGlobalConstants.bind(this), // собираем все константы
		
		// create DATA array
		// TOWNS 
		this.getTownsList.bind(this),
		this.getTownBuildingsTypes.bind(this),
		this.getTownBuildingsList.bind(this),
		
		this.getStats.bind(this),
		this.getHeroClasses.bind(this),
		


		this.getBattleInfo.bind(this),
		
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
PreloadDataClass.prototype.getTownsList = function(callback) {
	this.DATA.towns = {};
	Mongo.find({collection: 'game_Towns', callback: function(rows) {
		for(var i in rows) {
			rows[i].id = String(rows[i].id);
			this.DATA.towns[rows[i].id] = {
				id: rows[i].id,
				ruName: rows[i].ruName,
				enName: rows[i].enName
			};
		}
		callback();
	}.bind(this)});
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
PreloadDataClass.prototype.getTownBuildingsTypes = function(callback) {
	this.DATA.buildingsTypes = {};
	Mongo.find({collection: 'game_TownsBuildingsTypes', callback: function(rows) {
		for(var i in rows) {
			rows[i].id = String(rows[i].id);
			this.DATA.buildingsTypes[rows[i].id] = {
				id: rows[i].id,
				name: rows[i].name
			};
		}
		callback();
	}.bind(this)});
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
PreloadDataClass.prototype.getTownBuildingsList = function(callback) {
	this.DATA.buildings = {};
	Mongo.find({collection: 'game_TownsBuildings', callback: function(rows) {
		for(var i in rows) {
			rows[i].id = String(rows[i].id);
			rows[i].townId = String(rows[i].townId);
			this.DATA.buildings[rows[i].id] = rows[i];
		}
		callback();
	}.bind(this)});	
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
PreloadDataClass.prototype.getItems = function(callback) {
	this.DATA.items = {};
	Mongo.find({collection: 'game_Items', callback: function(rows) {
		for(var i in rows) {
			rows[i]._id = rows[i]._id.toHexString();
			this.DATA.items[rows[i]._id] = rows[i];
		}
		callback();
	}.bind(this)});
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
PreloadDataClass.prototype.getSpineSlots = function(callback) {
	this.DATA.spineSlots = {};
	
	Mongo.find({collection: 'game_ItemsSpineSlots', callback: function(rows) {
		for(var i in rows) {
			rows[i].id = String(rows[i].id);
			this.DATA.spineSlots[rows[i].id] = {
													id: rows[i].id,
													name: rows[i].name
												};
		}
		callback();
	}.bind(this)});
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
PreloadDataClass.prototype.getInventorySlotsList = function(callback) {
	this.DATA.inventorySlotsList = {};
	Mongo.find({collection: 'game_ItemsInventorySlotsList', callback: function(rows) {
		for(var i in rows) {
			rows[i].id = String(rows[i].id);
			this.DATA.inventorySlotsList[rows[i].id] = {
															id: rows[i].id,
															imageId: String(rows[i].imageId),
															order: String(rows[i].order)
														};
		}
		callback();
	}.bind(this)});
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
PreloadDataClass.prototype.getNpcsInfo = function(callback) {
	this.DATA.npcsInfo = {};
	Mongo.find({collection: 'game_NpcsInfo', callback: function(rows) {
		for(var i in rows) {
			this.DATA.npcsInfo[rows[i]._id] = rows[i];
		}
		callback();
	}.bind(this)});
}


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
PreloadDataClass.prototype.fillNpcsCollectionWithData = function(callback) {
	for(var npcId in this.DATA.npcsInfo) {
		for(var count = 1; count <= this.DATA.npcsInfo[npcId].count; count++) {
			var newNpc = new NpcClass();
			newNpc.createNewUser({npcId: npcId}, callback);
		}
	}
}





/**************** USERS ************/	

/*
	* Description:
	*	Добавляет пользователя в глобальный массив
	*	
	*	@user: object, type User
	*
	* @since  19.08.15
	* @author pcemma
*/
PreloadDataClass.prototype.addUserToGlobalUsersArray = function(user, callback) {
	console.log("addUserToGlobalUsersArray");
	this.USERS[user.userId] = user;
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
PreloadDataClass.prototype.getBattleInfo = function(callback) {
	this.DATA.battleInfo = {};
	Mongo.find({collection: 'game_BattleInfo', callback: function(rows) {
		this.DATA.battleInfo = rows[0];
		callback();
	}.bind(this)});
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
PreloadDataClass.prototype.getStats = function(callback) {	
	this.DATA.stats = {};
	
	Mongo.find({collection: 'game_Stats', callback: function(rows) {
		for(var i in rows) {
			rows[i].id = String(rows[i].id);
			this.DATA.stats[rows[i].name] = rows[i];
		}
		callback();
	}.bind(this)});
}


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
	
	Mongo.find({collection: 'game_HeroClasses', callback: function(rows) {
		for(var i in rows) {
			this.DATA.heroClasses[rows[i]._id] = rows[i];
		}
		callback();
	}.bind(this)});
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
PreloadDataClass.prototype.createGlobalConstants = function(callback) {
	this.globalConstants = {};
	Mongo.find({collection: 'game_GlobalConstants', callback: function(rows) {
		for(var i in rows) {
			// get client version
			if(rows[i].name === "clientVersion") {
				rows[i].value = rows[i].value.split(".");
			}
			this.globalConstants[rows[i].name] = rows[i].value;
		}
		callback();
	}.bind(this)});
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
}



module.exports = PreloadDataClass;
console.log("User CLASS is connected");	

var async 								= require("async"),
	crypto 									= require('crypto'),
	eventemitter2 					= require("eventemitter2"),
	Mongo 									= require("./MongoDBClass.js"),
	GLOBAL 									= require("./PreloadDataClass.js"),
	StatsManagerClass 			= require("./StatsManagerClass.js"),
	LevelsManagerClass 			= require("./LevelsManagerClass.js"),
	StuffItemsManagerClass 	= require("./StuffItemsManagerClass.js"),
	ItemClass 							= require("./ItemClass.js"),
	utils 									= require("./UtilsClass.js");


function User() {

	this.dbName = 'game_Users';
	this.isUser = true;


	// USER DATA
	this.autoConfigData = {};
	
	this.userData = {
						// items: {}, 	// Предметы
						// stuff: {}, 	// Надетые вещи
						// stats: {} 	// Статы юзера
					};

	// this.on("test", this.test.bind(this));
}


User.prototype = Object.create(eventemitter2.prototype);




/*
	* Description:
	*	Отправляет по сокету данные клиенту 
	*	
	*	@data: array, array of params
	*			
	*
	* @since  22.04.14
	* @author pcemma
*/
User.prototype.socketWrite = function (data) {
	if(this.socket) {
		var string_params = JSON.stringify(data);
		var bytes_count = utils.return_bytes(string_params);
		this.socket.write(bytes_count+string_params);
	}
};
	

/*
	* Description:
	*	function Проверяет есть ли пользователь с таким емайл и паролем в базе. если есть, возвращает ид этого пользователя
	*	
	*	@autoConfigData:
	*		@email:		str, email of the user
	*		@password:	str, password of the user
	*
	*
	*	return: int/boolean, user_id if user exist, false if not!
	*
	* @since  25.01.15
	* @author pcemma
*/
User.prototype.check = function(autoConfigData, callback) {
	if(
		autoConfigData && 
		autoConfigData.email && autoConfigData.email !== "" &&
		autoConfigData.password && autoConfigData.password !== ""
	) {
		// console.log(autoConfigData.email.toLowerCase(), crypto.createHash('md5').update(String(autoConfigData.password)).digest('hex'));
		Mongo.find({
			collection: this.dbName, 
			searchData: {
				email: autoConfigData.email.toLowerCase(), 
				password: crypto.createHash('md5').update(String(autoConfigData.password)).digest('hex')
			},
			fields: {_id: true},
			callback: function (rows) {
				console.log("CHECK USER!!!");
				if(rows.length > 0) {
					this.userId = rows[0]._id;
				}
				callback();
			}.bind(this)
		});
	}
};







/*
	* Description:
	*	function Создаем нового пользователя. Заполняем все необходимые данные в базе данных. 
	*	
	*
	*	@data:				array
	*		@autoConfigData: 	array
	*			@email:			str, email of the user
	*			@password:		str, password of the user
	*		@uid:				
	*		@langLocale:		
	*		@device:		
	*		@deviceSystemVersion:		
	*		@deviceToken:		
	*		@clientVersion:		
	*	
	*
	*
	*
	*
	*
	*
	* @since  25.01.15
	* @author pcemma
*/
User.prototype.createNewUser = function(data, callback) {
	console.log("ADD NEW USER!!!");
	var queues = [
		this.addDefaultUser.bind(this, data),
		this.addDefaultItems.bind(this)
	];
	
	async.waterfall(
		queues,
		function(err) {
			console.log("User createNewUser");
			callback();
		}.bind(this)
	)
};
	

/*
	* Description:
	*	function Заполняем все необходимые данные в базе данных о новом юзере. 
	*	
	*
	*	@data:				array
	*		@autoConfigData: 	array
	*			@email:			str, email of the user
	*			@password:		str, password of the user
	*
	*
	* @since  10.08.15
	* @author pcemma
*/
User.prototype.addDefaultUser = function(data, callback) {
	var currentTime = Math.floor(+new Date() / 1000),
		login =	"guest"+(+new Date());
	this.autoConfigData = {
		password: 	Math.random().toString(36).substr(2, 10),
		login:	login,
		email:	login+"@bew.net"
	};
	
	Mongo.insert({
		collection: this.dbName, 
		insertData: {
			email: this.autoConfigData.email,
			password: crypto.createHash('md5').update(String(this.autoConfigData.password)).digest('hex'),
			registrationDate: currentTime,
			userData: {
				login: this.autoConfigData.login,
				lastActionTime: 0,
				inBattleFlag: false,
				isAliveFlag: true,
				level: 1,
				items:{},
				stuff: {},
				// TODO: это переделать!
				stats: this.getDefaultStats("55fb3de3445254e819e3ad11") 
			},
		}, 
		callback: function(rows) {
			this.userId = rows.ops[0]._id;
			callback();
		}.bind(this)
	}); 		
};
	

/*
	* Description:
	*	Получает массив статов по классу
	*	
	*	@heroClassId: str, Id класс героя
	*	
	*	
	*	return: array, массив с набором статов по умолчанию.
	*
	* @since  10.08.15
	* @author pcemma
*/
User.prototype.getDefaultStats = function(heroClassId) {
	return GLOBAL.DATA.heroClasses[heroClassId].stats;
};


/*
	* Description:
	*	Добавляем вещи новому игроку
	*	
	*	
	*
	* @since  10.08.15
	* @author pcemma
*/
User.prototype.addDefaultItems = function(callback) {
	// TODO: добавить стандартный массив вещей, который дается сразу юзеру при старте. 
	var defaultItemsArray = [
			"55ba5662d95a08c8513f668b",
			"55ba5662d95a08c8513f668d",
			"55ba5662d95a08c8513f668e",
			"55ba5662d95a08c8513f6690",
			"55ba5662d95a08c8513f6691"
		];
	
	for(var i in defaultItemsArray) {
		var itemId = defaultItemsArray[i];
		this.addItem({
			stats: GLOBAL.DATA.items[itemId].stats,
			itemId: itemId,
			count: 1
		}, callback);
	}	
};


/*
	* Description:
	*	function Заполняем все необходимые данные в базе о информации о пользователе.. 
	*	
	*
	*	@data:				array
	*		@uid:				
	*		@langLocale:		
	*		@device:		
	*		@deviceSystemVersion:		
	*		@deviceToken:		
	*		@clientVersion:		
	*
	*
	* @since  10.08.15
	* @author pcemma
*/
User.prototype.updateClientInfo = function(data, callback) {
	var insertData = {$set:{
			uid: (data.uid) ? data.uid : "",
			langLocale: (data.langLocale) ? data.langLocale : "",
			device: (data.device) ? data.device : "",
			deviceSystemVersion: (data.deviceSystemVersion) ? data.deviceSystemVersion : "",
			deviceToken: (data.deviceToken) ? data.deviceToken : "",
			//TODO: Add new geoip Geoip now removed from lib
			// country: (data.ip) ? utils.getCountryByIp(data.ip) : "",

			clientVersion: (data.clientVersion) ? data.clientVersion : "",
			ip: (data.ip) ? data.ip : ""
		}};
	Mongo.update({collection: this.dbName, searchData: {_id: Mongo.objectId(this.userId)}, insertData: insertData, callback: function(rows) { callback(); }});
};






// AUTH //


/*
	* Description:
	*	function авторизация пользователя
	*	
	*	
	*	return: 
	*
	* @since  07.08.15
	* @author pcemma
*/
User.prototype.authorization = function(data, callback) {
	var queues = [];
	// проверяем на то что такой пользователь есть и верно введены данные для авторизации
	if(
		data.autoConfigData && 
		((data.autoConfigData.email && data.autoConfigData.email !== "") ||
		(data.autoConfigData.password && data.autoConfigData.password !== ""))
	) {
		// Тут проверка без учета самого пользователя, который может проверять
		queues.push(this.check.bind(this, data.autoConfigData));
	}
	else {
		// проверка на то что мы делаем нового гостя. поля мейл и пароль пусты
		queues.push(this.createNewUser.bind(this, data));
	}
	
	// Обновление инфы об пользователе. Uid, ip etc.
	queues.push(this.updateClientInfo.bind(this, data));
	


	// queues.push(this.addItem.bind(this, {
	// 	stats: GLOBAL.DATA.items["57529dcd89b8546c31c2e79e"].stats,
	// 	itemId: "57529dcd89b8546c31c2e79e",
	// 	count: 1
	// }));
	

	// Сбор данных о юзере.
	queues.push(this.getUserData.bind(this));
	
	async.waterfall(
		queues,
		function(err) {
			console.log("User authorization");
			var sendData = {};
			// мы удачно все прошли, нашли нужного пользователя с теми данными что прислыли, либо создали гостя
			if(this.userId) {
				// Get verifyHash
				this.socket = data.socket;
				this.verifyHash = crypto.createHash('md5').update(String(+new Date()) + secretHashString + this.userId).digest('hex');
				// this.ping = Math.floor(+new Date() / 1000);
				//TODO: стоит удалять this.autoConfigData, на всякий случай :)
				sendData =  {
					userData: this.userData, 
					userId: this.userId, 
					verifyHash: this.verifyHash, 
					autoConfigData: this.autoConfigData
				};	
			}
			else {
				// Ответ что у мы не можем авторизоваться (не верные данные)
				console.log("Not such user!!!");
				sendData = {incorrectFlag: true};
			}

			this.socketWrite({f: "authorizationResponse", p: sendData});

			callback();
		}.bind(this)
	)
};


/*
	* Description:
	*	Собирает массив данных о пользователе. 
	*	@userId:	int, ид пользователя
	*	
	*	return: 
	*
	* @since  21.02.15
	* @author pcemma
*/
User.prototype.getUserData = function(callback) {
	console.log("this.userId", this.userId, typeof(this.userId));
	Mongo.find({
		collection: this.dbName, 
		searchData: {_id: Mongo.objectId(this.userId)}, 
		fields: {userData: true}, 
		callback: function(rows) {
			if(rows.length > 0) {
				//TODO: отдельно в метод setUserData
				this.userData = rows[0].userData;

				this.userData.stats = new StatsManagerClass(rows[0].userData.stats);
				
				this.userData.levels = new LevelsManagerClass(rows[0].userData.levels);

				var queues = [
					// Собираем вещи юзера. Данные про вещи текущие в коллеции game_WorldItems
					this.getItems.bind(this)
				];
				
				async.waterfall(
					queues,
					function(err) {
						console.log("Get userData");
						callback();
					}.bind(this)
				);
			}
		}.bind(this)
	});	
};




/*****************	BATTLE	******************/


/*
	* Description: Функция Проверяет в бою ли игрок
	*
	*
	*
	* @since  11.09.15
	* @author pcemma
*/
User.prototype.isInBattle = function() {
	return this.userData.inBattleFlag;
};


/*
	* Description: Функция Проверяет, что игрок именно в этом бою и в бою вообще.
	*
	*	@data:	arr,
	*		battleId: 	int, ид боя
	*
	*
	* @since  11.09.15
	* @author pcemma
*/
User.prototype.isInCurrentBattle = function(battleId) {
	return this.isInBattle() && this.userData.battleId === battleId;
};


/*
	* Description: Проверка мерт ли герой. 
	*
	*
	* @since  19.03.16
	* @author pcemma
*/
User.prototype.checkIfHeroIsDead = function(callback) {
	// TODO: ВОТ ТУТ ВОТ НАДО В БАЗ МЕНЯТЬ!!!!!
	console.log("this.userData.stats.currentHp <= 0", this.userData.stats.currentHp <= 0);
	if(this.userData.stats.currentHp <= 0) {
		//TODO: set hp!
		this.userData.stats.currentHp = 0;
		//TODO: Обновление флага и в базе тоже! мертвые не могут делать многих вещей!
		this.userData.isAliveFlag = false;
	}
	callback();
};


/*
	* Description: Проверка мерт ли герой. 
	*
	*
	* @since  01.03.15
	* @author pcemma
*/
User.prototype.isAlive = function() {
	return this.userData.isAliveFlag;
};


/*
	* Description: Проверка является ли врагом данный игрок. 
	*
	*	@data:
	*		@teamId: 	str, ид команды в которой данный игрок не должен находиться!
	*
	*
	* @since  14.09.15
	* @author pcemma
*/
User.prototype.isEnemy = function(teamId) {
	return this.userData.teamId !== teamId;
};


/*
	* Description: Проверка на доступный ли этот игрок для действий над ним со стороны опонента. 
	*
	*	@data:
	*		@battleId: 	str, ид боя для проверки нахождения игрока именно в этмо бою.
	*		@teamId: 	str, ид команды в которой данный игрок не должен находиться!
	*
	*
	* @since  14.09.15
	* @author pcemma
*/
User.prototype.isAvailableEnemy = function(data) {
	return this.isInCurrentBattle(data.battleId) && this.isAlive() && this.isEnemy(data.teamId);
};


/*
	* Description: Проверка на доступнонсть делать действие в бою. 
	*
	*	@data:
	*		@battleId: 	str, ид боя для проверки нахождения игрока именно в этмо бою.
	*
	*
	* @since  14.09.15
	* @author pcemma
*/
User.prototype.isReadyForAction = function(data) {
	return this.isInCurrentBattle(data.battleId) && this.isAlive() && this.canDoAction();
};


/*
	* Description: Проверка на доступнонсть делать действие. 
	*
	*
	*
	* @since  14.09.15
	* @author pcemma
*/
User.prototype.canDoAction = function() {
	var currentTime = Math.floor(+new Date() / 1000);
	return this.userData.lastActionTime <= currentTime;
};


/*
	* Description: Функция добавляет героя в бой.
	*
	*	@data:	arr,
	*		battleId: 	int, ид боя
	*		teamId: 	int, ид команды
	*		hexId: 		int, ид гекса 
	*
	*
	* @since  06.03.15
	* @author pcemma
*/
User.prototype.addToBattle = function(data, callback) {
	// ставим данные о бое
	var queues = [
		this.setBattleData.bind(this, data)
	];
	
	async.waterfall(queues, function(err) {
		// Start listner for add to battle
		this.emit('addToBattleListener');
		callback();
	}.bind(this));
};


/*
	* Description: Update
	*
	*	@battleData:	arr,
	*
	*
	* @since  12.05.15
	* @author pcemma
*/
User.prototype.setBattleData = function(battleData, callback) {
	// TODO: возможно некоторые надо обновлять в базе например inBattleFlag
	Object.keys(battleData).forEach(function(stat) {
		if(stat === "action") {
			this.setLastActionTime(battleData[stat]);
		} else {
			this.userData[stat] = battleData[stat];
		}
	}.bind(this));

	this.battleData = {
		damageDone: 0,
		damageGet: 0
	};

	callback();
};


/*
	* Description:
	*	function получаем все данные про героя, которые отправляются в бой
	*	
	*
	*
	* @since  19.09.15
	* @author pcemma
*/
User.prototype.getUserDataForBattle = function() {
	var dataArray = ['battleId', 'teamId', 'isAliveFlag', 'hexId', 'login', 'stats', 'stuff', 'shotId'],
		info = {
			id: this.userId,
			npcId: this.userData.npcId,
			lastActionTime: this.getRemainLastActionTime()
		};
	dataArray.forEach(function(element) {
		if(element in this.userData) {
			info[element] = this.userData[element];
		}
	}.bind(this));

	console.log("info.stuff");
	return info;
};


/*
	* Description:
	*	function получаем остаток времени в секундах до следующего дейсвтия
	*	
	*
	*
	* @since  19.09.15
	* @author pcemma
*/
User.prototype.getRemainLastActionTime = function() {
	var currentTime = Math.floor(+new Date() / 1000);
	return (currentTime < this.userData.lastActionTime) ? (this.userData.lastActionTime - currentTime) : 0;
};


/*
	* Description:
	*	function Устанавливает новое время до следующего дейсвтия
	*	
	*	@action: str, Название дейсвтияпосле которого ставноится новое время до следующего дейсвтия
	*
	* @since  19.09.15
	* @author pcemma
*/
User.prototype.setLastActionTime = function(action) {
	var currentTime = Math.floor(+new Date() / 1000);
	this.userData.lastActionTime = currentTime + this.userData.stats[action+'ActionTime'];
};


/*
	* Description: Функция считает удар, который герой может нанести
	*
	*
	* @since  02.03.15
	* @author pcemma
*/
User.prototype.countDamage = function() {
	var damage = Math.floor(Math.random() * (this.userData.stats.maxDamage - this.userData.stats.minDamage + 1)) + this.userData.stats.minDamage;
	damage = (damage < 0) ? 0 : damage;
	return damage;
};


/*
	* Description: Hero get damage
	*
	*
	* @since  19.03.16
	* @author pcemma
*/
User.prototype.getDamage = function(damage, callback) {
	var queues = [
		this.updateStats.bind(this, {currentHp: -damage}),
		this.checkIfHeroIsDead.bind(this)
	];
	async.waterfall(queues, function(err) {
		callback();
	});
};


/*
	* Description: Clear data after battle
	*
	*
	*
	* @since  03.05.16
	* @author pcemma
*/
User.prototype.clearBattleData = function(callback) {
	// TODO: это временное решение для того что бы можно было сразу вступить в бой заново!
	this.updateStats({currentHp: (this.userData.stats.hp - this.userData.stats.currentHp)});
	this.userData.isAliveFlag = true;

	this.userData.inBattleFlag = false;
	delete this.userData.battleId;
	delete this.userData.teamId;
	delete this.userData.hexId;
	
	// Start listner for removing from battle
	this.emit('removeFromBattleListener');

	callback();
};


/*
	* Description: set battle win flag. 
	*
	*	@winTeamId: int, id of the team wich won the battle
	*
	*
	* @since  30.04.16
	* @author pcemma
*/
User.prototype.setBattleWinFlag = function(winTeamId) {
	this.userData.winBattleFlag = (this.userData.teamId === winTeamId);
};


/*
	* Description: Calulate completion data
	*
	*	@winTeamId: int, id of the team wich won the battle
	*
	* @since  27.04.16
	* @author pcemma
*/
User.prototype.calculateCompletionData = function(data, callback) {
	var queues = [];
	this.setBattleWinFlag(data.winTeamId);
	
	queues.push(this.calculateCompletionHeroExp.bind(this));

	async.waterfall(queues, function(err) {
		callback();	
	}.bind(this));
};


/*
	* Description: Calulate exp for hero after battle
	*
	*
	*
	* @since  27.04.16
	* @author pcemma
*/
User.prototype.calculateCompletionHeroExp = function(callback) {
	var expCount = 5;
	if(this.userData.winBattleFlag) {
		expCount = 10;
	}

	this.battleData.heroExp = expCount;


	this.updateExp(expCount, "heroLevel", callback);
};






/*****************	ITEMS	******************/


/*
	* Description:
	*	Собирает список итемов (предметов) у пользователя
	*	
	*
	* @since  12.08.15
	* @author pcemma
*/
User.prototype.getItems = function(callback) {
	console.log("GET ITEMS!!!");
	Mongo.find({collection: 'game_WorldItems', searchData: {userId: Mongo.objectId(this.userId)}, callback: function(rows) {
		this.userData.items = {};
		this.userData.stuff = new StuffItemsManagerClass();

		for(var i in rows) {
			var worldItemId = rows[i]._id.toHexString();
			this.userData.items[worldItemId] = new ItemClass(rows[i]);
			
			for(var j in rows[i].inventorySlotId) {
				var inventorySlotId = String(rows[i].inventorySlotId[j]);
				var stuffItem = {
					userItemId: worldItemId,
					itemId: 		rows[i].itemId,
					inventorySlotId: inventorySlotId
				};
				this.userData.stuff.addItem(stuffItem);
			}
		}
		callback();
	}.bind(this)});
};


/*
	* Description:
	*	Добавляет вещь пользователю. Сначало надо доабвить вещь в коллецию game_WorldItems. Если такая вещь есть, и ее она количественная то надо увеличить количество
	*	
	*
	* @since  11.08.15
	* @author pcemma
*/
User.prototype.addItem = function(data, callback) {
	if(GLOBAL.isItemExist(data.itemId)) {
		
		// Если предмет исчесляемый, то если он есть надо увеличить количество.
		if(GLOBAL.DATA.items[data.itemId].countableFlag) {
			
			
		}
		else {
			Mongo.insert({
				collection: "game_WorldItems", 
				insertData: {
					stats: data.stats,
					itemId: data.itemId,
					count: data.count,
					userId: this.userId,
					inventorySlotId: data.inventorySlotId || []
				},  
				callback: function(rows) {
					callback();
				}.bind(this)
			}); 
		}
	}
};


/*
	* Description:
	*	Надевает вещь на героя
	*	
	*	@data:	array
	*		@itemId:	int, worldItemId - id из коллекции game_WorldItems
	*	
	*	
	*
	* @since  15.08.15
	* @author pcemma
*/
User.prototype.wearOnItem = function(data) {
	var worldItemId = data.itemId,
		queues = [];
	if(
		// TODO: Проверка на то что ее можно надеть, что она подходит по статам, и что она не надета уже!
		this.hasItem(worldItemId) && 
		GLOBAL.isItemExist(this.userData.items[worldItemId].itemId)
	) {
		var itemId = this.userData.items[worldItemId].itemId;
			
		//TODO: добавлять все бонусы и прочее
		queues = [
			this.wearOffItems.bind(this, GLOBAL.DATA.items[itemId].inventorySlots),
			this.updateStats.bind(this, GLOBAL.DATA.items[itemId].stats),
			this.addItemToStuff.bind(this, {userItemId: worldItemId, itemId: itemId})
		];
		
		async.waterfall(queues, function(err) {
			this.socketWrite({
				f: "userWearOnItem", 
				p: {itemId: worldItemId}
			});
		}.bind(this));
	}
};


/*
	* Description:
	*	Снимает вещи с героя обходя нужные слоты
	*	
	*	@inventorySlots: 	arr, массив слотов с которых нужно снять вещи.
	*	
	*
	* @since  20.09.15
	* @author pcemma
*/
User.prototype.wearOffItems = function(inventorySlots, callback) {
	var queues = [];
	for(var inventorySlotId in inventorySlots) {
		if(this.userData.stuff.isInventorySlotFull(inventorySlotId)) {
			var userItemId = this.userData.stuff.getUserItemId(inventorySlotId);
			queues.push(this.wearOffItem.bind(this, {itemId: userItemId}));
		}
	}
	async.waterfall(queues, function(err) {
		callback();
	}.bind(this));
};


/*
	* Description:
	*	Снимает вещь с героя
	*	
	*	@data:	array
	*		@itemId:	int, id вещи из таблицы game_UsersItems
	*	
	*	
	*
	* @since  09.06.15
	* @author pcemma
*/
User.prototype.wearOffItem = function(data, callback) {
	var worldItemId = data.itemId,
		queues = [];
	if(
		this.hasItem(worldItemId) && 
		GLOBAL.isItemExist(this.userData.items[worldItemId].itemId)
	) {
		var itemId = this.userData.items[worldItemId].itemId;
		
		queues = [
			this.updateStats.bind(this, this.userData.items[worldItemId].revertStats()),
			this.removeItemFromStuff.bind(this, {userItemId: worldItemId, itemId: itemId})
		];

		async.waterfall(queues, function(err) {
			this.socketWrite({
				f: "userWearOffItem", 
				p: {itemId: worldItemId}
			});
			//TODO: проверить корректно ли так проверять callback
			if(callback) {
				callback();
			}
		}.bind(this));
	}
};


/*
	* Description:
	*	Добавляет вещь в стафф героя
	*	
	*	@data: arr,
	*		@userItemId: 	str, ид вещи из таблицы game_WorldItems
	*		@itemId: 		str, ид вещи из таблицы game_Items
	*	
	*
	* @since  20.09.15
	* @author pcemma
*/
User.prototype.addItemToStuff = function(data, callback) {
	var inventorySlotsArray = [],
		userItemId = data.userItemId,
		itemId = data.itemId;
	// Проход по всем слотам, в которые надо надеть вещь, и добавление данных о вещи.
	for(var inventorySlotId in GLOBAL.DATA.items[itemId].inventorySlots) {
		data.inventorySlotId = inventorySlotId;
		inventorySlotsArray.push(inventorySlotId);
		this.userData.stuff.addItem(data);
	}

	this.userData.items[userItemId].setToInventorySlot(inventorySlotsArray, callback);
};


/*
	* Description:
	*	Удаляет вещь из стаффа героя
	*	
	*	@data: arr,
	*		@userItemId: 	str, ид вещи из таблицы game_WorldItems
	*		@itemId: 		str, ид вещи из таблицы game_Items
	*	
	*
	* @since  20.09.15
	* @author pcemma
*/
User.prototype.removeItemFromStuff = function(data, callback) {
	var userItemId = data.userItemId,
		itemId = data.itemId;
	// Проход по всем слотам, в которых надета вещь, и удаление данных о вещи.
	for(var inventorySlotId in GLOBAL.DATA.items[itemId].inventorySlots) {
		this.userData.stuff.removeItem(inventorySlotId, userItemId);
	}
	this.userData.items[userItemId].setToInventorySlot([], callback);
};


/*
	* Description:
	*	Проверяет есть ли вещь у пользователя
	*	
	*	@worldItemId:	int, id вещи из таблицы game_WorldItems
	*
	* @since  11.09.15
	* @author pcemma
*/
User.prototype.hasItem = function(worldItemId) {
	//TODO: возможно тут надо проверить есть ли такая вещь в мире вообще!
	return worldItemId in this.userData.items;
};






/*****************	STATS	******************/


/*
	* Description:
	*	Update stats
	*	
	*	@data:	obj, список статов ввиде {statName: value}
	*		
	*
	* @since  20.09.15
	* @author pcemma
*/
User.prototype.updateStats = function(data, callback) {
	// console.log("\n\n\n", "UPDATE STATS");
	// console.log("DATA:", data);
	// console.log("========================");
	// console.log("BEFORE:", this.userData.stats);
	// console.log("========================");
	var updatedStats = this.userData.stats.update(data);
	this.updateStatsInDb(updatedStats, callback);
};


/*
	* Description:
	*	Update stats in db for user
	*	
	*	@updatedStats:	obj, список статов ввиде {statName: value}
	*		
	*
	* @since  25.09.15
	* @author pcemma
*/
User.prototype.updateStatsInDb = function(updatedStats, callback) {
	var insertData = {};
	Object.keys(updatedStats).forEach(function(stat) {
		insertData["userData.stats." + stat] = updatedStats[stat];
	});
	Mongo.update({
		collection: this.dbName,
		searchData: {_id: Mongo.objectId(this.userId)},
		insertData: {$inc: insertData},
		callback: function() {
			// console.log("AFTER:", this.userData.stats);
			// console.log("========================");
			if(callback) { callback(); }
		}.bind(this)
	});
};




/*****************	Levels	******************/

/*
	* Description:
	*	Update level for user
	*	
	*	@exp: 			int, added experience value
	*	@levelName: str, the name of the level which need to update
	*	@callback: 	func, callback function
	*
	* @since  02.05.16
	* @author pcemma
*/
User.prototype.updateExp = function(exp, levelName, callback) {
	if(this.isUser) {
		this.userData.levels.updateExp(exp, levelName);
		console.log("\n\n updateExp");
		this.updateExpInDb(levelName, callback);
	} else {
		callback();
	}
}


/*
	* Description:
	*	Update level in db for user
	*	
	*
	*		
	*
	* @since  02.05.16
	* @author pcemma
*/
User.prototype.updateExpInDb = function(levelName, callback) {
	var insertData = {};
	insertData["userData.levels." + levelName] = this.userData.levels[levelName];
	Mongo.update({
		collection: this.dbName,
		searchData: {_id: Mongo.objectId(this.userId)},
		insertData: {$set: insertData},
		callback: function() {
			if(callback) { callback(); }
		}.bind(this)
	});
};

module.exports = User;
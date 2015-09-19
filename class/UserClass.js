console.log("User CLASS is connected");	

var crypto = require('crypto');


function User() {

	// this.userId = 0;
	
	// USER DATA
	this.autoConfigData = {};
	
	this.userData = {
						items: {}, 	// Предметы
						stuff: {}, 	// Надетые вещи
						stats: {} 	// Статы юзера
					};
}


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
		var bytes_count = lib.return_bytes(string_params);
		this.socket.write(bytes_count+string_params);
	}
}
	

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
			collection: 'game_Users', 
			searchData: {
				email: autoConfigData.email.toLowerCase(), 
				password: crypto.createHash('md5').update(String(autoConfigData.password)).digest('hex')
			},
			fields: {_id: true},
			callback: function (rows) {
				console.log("CHECK USER!!!");
				console.log(rows);
				if(rows.length > 0) {
					this.userId = rows[0]._id;
				}
				callback();
			}.bind(this)
		});
	}
}







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
}	
	

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
		collection: "game_Users", 
		insertData: {
			email: this.autoConfigData.email,
			password: crypto.createHash('md5').update(String(this.autoConfigData.password)).digest('hex'),
			registrationDate: currentTime,
			userData: {
				login: this.autoConfigData.login,
				lastActionTime: 0,
				inBattleFlag: false,
				isAliveFlag: true,
				items:{},
				stuff: {},
				stats: this.getDefaultStats("55fb3de3445254e819e3ad11") // TODO: это переделать!
			},
		}, 
		callback: function(rows) {
			this.userId = rows.ops[0]._id;
			callback();
		}.bind(this)
	}); 		
}
	

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
}


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
}


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
			country: (data.ip) ? lib.getCountryByIp(data.ip) : "",
			clientVersion: (data.clientVersion) ? data.clientVersion : "",
			ip: (data.ip) ? data.ip : ""
		}};
	Mongo.update({collection: 'game_Users', searchData: {_id: this.userId}, insertData: insertData, callback: function(rows) { callback(); }});
}






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
				this.verifyHash = crypto.createHash('md5').update(String(+new Date()) + config.secretHashString + this.userId).digest('hex');
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
}


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
	console.log("this.userId", this.userId);
	Mongo.find({
		collection: 'game_Users', 
		searchData: {_id: this.userId}, 
		fields: {userData: true}, 
		callback: function(rows) {
			if(rows.length > 0) {
				this.userData = rows[0].userData;
				var queues = [
					// Собираем вещи юзера. Данные про вещи текущие в коллеции game_WorldItems
					this.getItems.bind(this)
				];
				
				async.waterfall(
					queues,
					function(err) {
						console.log("Get userData");
						console.log(this.userData);
						callback();
					}.bind(this)
				);
			}
			// callback();	
		}.bind(this)
	});	
}




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
}


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
}


/*
	* Description: Проверка мерт ли герой. 
	*
	*
	* @since  01.03.15
	* @author pcemma
*/
User.prototype.isAlive = function() {
	if(this.userData.stats.currentHp <= 0 ) {
		this.userData.stats.currentHp = 0;
		this.userData.isAliveFlag = false;
	}
	return this.userData.isAliveFlag;
}


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
}


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
}


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
}


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
}


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
User.prototype.addToBattle = function(data) {
	// ставим данные о бое
	this.setBattleData(data);
	// запускаем листнер вступления в бой
	// TODO: переделать эту проверку
	(this.addToBattleListener) ? this.addToBattleListener() : 0;
}


/*
	* Description: Функция обновляет данные о бое в инфе героя.
	*
	*	@data:	arr,
	*		battleId: 	int, ид боя
	*		teamId: 	int, ид команды
	*		hexId: 		int, ид гекса 
	*
	*
	* @since  12.05.15
	* @author pcemma
*/
User.prototype.setBattleData = function(data) {
	this.userData.inBattleFlag = true;
	this.userData.battleId = data.battleId;
	this.userData.teamId = data.teamId;
	this.userData.hexId = data.hexId;
}

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
	var dataArray = ['teamId', 'isAliveFlag', 'hexId', 'login', 'stats', 'stuff'],
		info = {
			id: this.userId,
			npcId: this.npcId,
			lastActionTime: this.getRemainLastActionTime()
		};
	dataArray.forEach(function(element) {
		if(element in this.userData) {
			info[element] = this.userData[element];
		}
	}.bind(this));
	return info;
}


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
}


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
}


/*
	* Description: Функция удаляет героя из боя.
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
User.prototype.removeFromBattle = function(data) {
	// TODO: это временное решение для того что бы можно было сразу вступить в бой заново!
	this.userData.stats.currentHp = this.userData.stats.hp;
	this.userData.isAliveFlag = true;
	
	this.userData.inBattleFlag = false;
	delete this.userData.battleId;
	delete this.userData.teamId;
	delete this.userData.hexId;
	
	// TODO: переделать эту проверку
	(this.removeFromBattleListener) ? this.removeFromBattleListener() : 0;
}


/*
	* Description: Функция считает удар, который герой может нанести
	*
	*
	* @since  02.03.15
	* @author pcemma
*/
User.prototype.countDamage = function() {
	var damage = Math.floor(Math.random() * (this.userData.stats.maxDamage - this.userData.stats.minDamage + 1)) + this.userData.stats.minDamage;
	return damage;
}









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
		for(var i in rows) {
			var worldItemId = rows[i]._id.toHexString();
			this.userData.items[worldItemId] = rows[i];
			//Собираем данные о надетых вещах. 
			// TODO: Вынести это в отдельный метод, который собирает надетый стафф! 
			for(var j in rows[i].inventorySlotId) {
				var invetnorySlotId = String(rows[i].inventorySlotId[j]);
				this.userData.stuff[invetnorySlotId] = {
														userItemId: worldItemId,
														itemId: 	rows[i].itemId
													};
			}
		}
		callback();
	}.bind(this)});
}


/*
	* Description:
	*	Добавляет вещь пользователю. Сначало надо доабвить вещь в коллецию game_WorldItems. Если такая вещь есть, и ее она количественная то надо увеличить количество
	*	
	*
	* @since  11.08.15
	* @author pcemma
*/
User.prototype.addItem = function(data, callback) {
	if(data.itemId in GLOBAL.DATA.items) {
		
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
					console.log("Add item", rows.ops[0]._id);
					callback();
				}.bind(this)
			}); 
		}
	}
}


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
	var worldItemId = data.itemId;
	if(
		// TODO: Проверка на то что ее можно надеть, что она подходит по статам, и что она не надета уже!
		this.hasItem(worldItemId) // Проверка на то что такая вещь вообще есть у пользователя
	) {
		var itemId = this.userData.items[worldItemId].itemId;
		// Проверка на то, что такая вещь вообще есть в базе!
		if(itemId in GLOBAL.DATA.items) {
			
			// Проверка на то, то слот, в который хотим надеть вещь, свободен. Если нет, то надо снять предыдущую вещь.
			for(var inventorySlotId in GLOBAL.DATA.items[itemId].inventorySlots) {
				if(inventorySlotId in this.userData.stuff) {
					this.wearOffItem({itemId: this.userData.stuff[inventorySlotId].userItemId });
				}
			}
			
			// Надеваем вещь!
			// Проход по всем слотам, в которые надо надеть вещь, и добавление данных о вещи.
			var inventorySlotsArray = [];
			for(var inventorySlotId in GLOBAL.DATA.items[itemId].inventorySlots) {
				
				inventorySlotsArray.push(inventorySlotId);
				
				//TODO: добавлять статы вещи в статы юзера, все бонусы и прочее
				this.userData.stuff[inventorySlotId] = {
														userItemId: 	 worldItemId,
														itemId: 		 itemId
													};
			}
			// Обновляем слот ид в массиве свойств вещи пользователя.
			this.userData.items[worldItemId].inventorySlotId = inventorySlotsArray;
			
			var insertData = {$set:{inventorySlotId: inventorySlotsArray}};
			// TODO: Добавить асинхроность тут
			Mongo.update({collection: 'game_WorldItems', searchData: {_id: Mongo.objectId(worldItemId)}, insertData: insertData});
			
			this.socketWrite({
				f: "userWearOnItem", 
				p: {
					itemId: worldItemId
				}
			});
		}
	}
}


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
User.prototype.wearOffItem = function(data) {
	var worldItemId = data.itemId;
	if(
		this.hasItem(worldItemId)  // Проверка на то что такая вещь вообще есть у пользователя
	) {
		var itemId = this.userData.items[worldItemId].itemId;
		// Проверка на то, что такая вещь вообще есть в базе!
		if(itemId in GLOBAL.DATA.items) {
			// Проход по всем слотам, в которых надета вещь, и удаление данных о вещи.
			for(var inventorySlotId in GLOBAL.DATA.items[itemId].inventorySlots) {
				if(
					inventorySlotId in this.userData.stuff && // проверка на что слот такой занят
					this.userData.stuff[inventorySlotId].userItemId === worldItemId // Проверка что это именна та вещь вслоте, которую пытаются снять
				) {
					//TODO: вычитать статы вещи из статов юзера, все бонусы и прочее
					delete this.userData.stuff[inventorySlotId];
				}
			}
			
			// Обновляем слот ид в массиве свойств вещи пользователя.
			this.userData.items[worldItemId].inventorySlotId = [];
			var insertData = {$set:{inventorySlotId: []}};
			// TODO: Добавить асинхроность тут
			Mongo.update({collection: 'game_WorldItems', searchData: {_id: Mongo.objectId(worldItemId)}, insertData: insertData});
			
			this.socketWrite({
				f: "userWearOffItem", 
				p: {
					itemId: worldItemId
				}
			});
		}
	}
}


/*
	* Description:
	*	Проверяет есть ли вещь у пользователя
	*	
	*	@data:	array
	*		@worldItemId:	int, id вещи из таблицы game_WorldItems
	*
	* @since  11.09.15
	* @author pcemma
*/
User.prototype.hasItem = function(worldItemId) {
	return worldItemId in this.userData.items;
}






module.exports = User;
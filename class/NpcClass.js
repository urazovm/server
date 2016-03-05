console.log("Npc CLASS is connected");	

var UserClass = require("./UserClass.js");

function Npc() {

	this.userId = 0;
	
	// USER DATA
	this.userData = {
						// items: {}, 	// Предметы
						// stuff: {}, 	// Надетые вещи
						// stats: {} 	// Статы юзера
					};
}				

Npc.prototype = Object.create(UserClass.prototype);
Npc.prototype.constructor = Npc;





/*
	* Description:
	*	function Заполняем все необходимые данные в базе данных о новом нпц. 
	*	
	*
	*	@data:				array
	*		
	*
	*
	* @since  17.08.15
	* @author pcemma
*/
Npc.prototype.addDefaultUser = function(data, callback) {
	this.npcId = data.npcId;
	Mongo.insert({
		collection: "game_Npcs", 
		insertData: {
			userData: {
				npcId: data.npcId,
				login: GLOBAL.DATA.npcsInfo[data.npcId].name,
				lastActionTime: 0,
				inBattleFlag: false,
				isAliveFlag: true,
				items:{},
				stuff: {},
				stats: this.getDefaultStats()
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
	*	Добавляем статы новому нпц
	*	
	*	
	*	return: array, массив с набором статов по умолчанию.
	*
	* @since  17.08.15
	* @author pcemma
*/
Npc.prototype.getDefaultStats = function() {
	return GLOBAL.DATA.npcsInfo[this.npcId].stats;
};


/*
	* Description:
	*	Добавляем вещи новому нпц
	*	
	*	
	*
	* @since  10.08.15
	* @author pcemma
*/
Npc.prototype.addDefaultItems = function(callback) {
	for(var i in GLOBAL.DATA.npcsInfo[this.npcId].items) {
		var itemId = defaultItemsArray[i],
			inventorySlotArray = [];
		for(var inventorySlotId in GLOBAL.DATA.items[itemId].inventorySlots) {
			inventorySlotArray.push(inventorySlotId);
		}	
		
		this.addItem({
			stats: GLOBAL.DATA.items[itemId].stats,
			itemId: itemId,
			count: 1,
			inventorySlotId: inventorySlotArray
		}, callback);
	}	
};










/*****************	BATTLE	******************/


/*
	* Description:
	*	Листнер старта боя для нпц. ЗАпускает ИИ нашего нпц.
	*	
	*
	* @since  12.05.15
	* @author pcemma
*/
Npc.prototype.addToBattleListener = function() {
	this.searchEnemyInArea();
};


/*
	* Description:
	*	Листнер окончания боя для нпц. 
	*		1. Останавливает таймеры
	*	
	*
	* @since  01.06.15
	* @author pcemma
*/
Npc.prototype.removeFromBattleListener = function() {
	if(this.battleTimer) {
		clearTimeout(this.battleTimer);
	}
};


/*
	* Description:
	*	Поиск врагов в области удара.
	*	
	*
	* @since  15.05.15
	* @author pcemma
*/
Npc.prototype.searchEnemyInArea = function() {
	// TODO: Сделать поверку на то что бой еще идет. 
	if(this.isInBattle() && this.isAlive()) {
		if(this.canDoAction()) {
			var hexesArray = battlesManager.searchEnemyInArea({id: this.userData.battleId, hexId: this.userData.hexId, userId: this.userId});
			// Проверяем вернулся ли нам массив. Если нет, то боя такого нет, нам более нет надобности заводить таймеры для нпц.
			if(hexesArray) {
				// Проверка на количество гексов с врагами.
				if(hexesArray.length >= 1) {
					// Нашли врагов. 
					// TODO: Надо сделать проверку на поиск врага, самого близкого к герою.
					//TODO: переделать механизм выбора ячейки для передвижения, в данный момент это просто любая свободная ячейка.
					var enemyHexId = Math.floor((Math.random() * hexesArray.length));
					// Запоминаем гекс с врагом, который подошел по услвояим поиска. 
					this.userData.enemyHexId = hexesArray[enemyHexId];
					this.heroMakeHit();
				}
				else {
					// Врагов нет. Начинаем поиск свободных ячеек для перехода.
					this.findHexIdToMove();
				}
			}
		}
		else {
			console.log("else for searchEnemyInArea");
			this.battleTimer = setTimeout(this.searchEnemyInArea().bind(this), 500);
		}
	}
};


/*
	* Description:
	*	Поиск свободного гекса для перемещения
	*	
	*
	* @since  01.06.15
	* @author pcemma
*/
Npc.prototype.findHexIdToMove = function() {
	// TODO: Сделать поверку на то что бой еще идет. 
	if(	this.isInBattle() && this.isAlive()) {
		if(this.canDoAction()) { 
			var hexesArray = battlesManager.searchFreeHexesInArea({id: this.userData.battleId, hexId: this.userData.hexId, userId: this.userId});
			// Проверяем вернулся ли нам массив. Если нет, то пустых гексовдля передвижения в области нет. 
			// Проверка на количество гексов для передвижения.
			if(hexesArray.length >= 1) {
				//TODO: переделать механизм выбора гекса для передвижения, в данный момент это просто любая свободная ячейка.
				var hexToMoveId = Math.floor((Math.random() * hexesArray.length));
				battlesManager.moveHero({id: this.userData.battleId, hexId: hexesArray[hexToMoveId], userId: this.userId});			
				this.battleTimer = setTimeout(this.searchEnemyInArea.bind(this), this.userData.stats.moveActionTime * 1000);								
			}
			else {
				// Свободных гексов нет. Надо заново проверить область на поиск врага. 
				// Используем moveActionTime, потому что дейсвтие должно быть сделано по таймеру движения. 
				this.battleTimer = setTimeout(this.searchEnemyInArea().bind(this), this.userData.stats.hitActionTime * 1000);
			}	
		}
		else {
			console.log("else for findHexIdToMove");
			this.battleTimer = setTimeout(this.findHexIdToMove().bind(this), 500);
		}
	}
};


/*
	* Description:
	*	Совершение удара по врагу
	*	
	*
	* @since  01.06.15
	* @author pcemma
*/
Npc.prototype.heroMakeHit = function() {
	var isNpcHit = battlesManager.heroMakeHit({id: this.userData.battleId, hexId: this.userData.enemyHexId, userId: this.userId});
	if(isNpcHit) {
		this.battleTimer = setTimeout(this.heroMakeHit.bind(this), this.userData.stats.hitActionTime * 1000);
	}
	else {
		this.battleTimer = setTimeout(this.searchEnemyInArea().bind(this), this.userData.stats.hitActionTime * 1000);
	}	
};




module.exports = Npc;

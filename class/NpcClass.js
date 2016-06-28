console.log("Npc CLASS is connected");	

var mongoose 		= require("mongoose"),
	GLOBAL 				= require("./PreloadDataClass"),
	eventEmitter 	= require("./EventEmitterClass"),
	UserClass 		= require("./UserClass");


function Npc() {
	UserClass.call(this);

	this.dbName = 'game_npcs';
	this.isUser = false;


	this.on('addToBattleListener', this.addToBattleListener.bind(this));
	this.on('removeFromBattleListener', this.removeFromBattleListener.bind(this));
	this.on('repeatMakeHitListener', this.repeatMakeHitListener.bind(this));
	this.on('repeatSearchEnemyListener', this.repeatSearchEnemyListener.bind(this));
}				

Npc.prototype = Object.create(UserClass.prototype);
Npc.prototype.constructor = Npc;





/*
	* Description:
	*	function Fill npc collection with new document
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

	var npcId = data.npcId,
		insertData = {
		userData: {
			npcId: npcId,
			lastActionTime: 0,
			inBattleFlag: false,
			isAliveFlag: true,
			items:{},
			stuff: {},
			shotId: GLOBAL.DATA.npcsInfo[npcId].shotId,
			levels : {
        heroLevel : {
          level : GLOBAL.DATA.npcsInfo[npcId].level
        }
      },
			stats: this.getDefaultStats()
		}
	};

	

	mongoose.model(this.dbName).create(insertData, function (err, rows) {
    this.userId = String(rows._id);
  	callback();
  }.bind(this)); 		
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
	console.log("GLOBAL.DATA.npcsInfo[this.npcId]", GLOBAL.DATA.npcsInfo);
	return GLOBAL.DATA.npcsInfo[this.npcId].stats;
};


/*
	* Description:
	*	Get default items array for new npc
	*	
	*	
	*	
	*	return: array, of the defaults items for npc
	*
	* @since  28.06.16
	* @author pcemma
*/
Npc.prototype.getDefaultItems = function() {
	return GLOBAL.DATA.npcsInfo[this.npcId].items || [];
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
	*	Listener to remove npc from battle
	*		1. stop battle timer
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
	*	Search enemies in attack radius
	*	
	*
	* @since  15.05.15
	* @author pcemma
*/
Npc.prototype.searchEnemyInArea = function() {
	// TODO: Сделать поверку на то что бой еще идет. 
	if(this.isInBattle() && this.isAlive()) {
		if(this.canDoAction()) {
			var sendData = {
				id: this.userData.battleId, 
				hexId: this.userData.hexId, 
				userId: this.userId,
				radius: this.userData.stats.attackRadius
			}
			eventEmitter.emit('battleSearchEnemyInArea', sendData, this.tryToHitNpc.bind(this));
		}
		else {
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
			var sendData = {	
				id: this.userData.battleId, 
				hexId: this.userData.hexId, 
				userId: this.userId,
				radius: this.userData.stats.moveRadius
			};
			eventEmitter.emit('battleSearchFreeHexesInArea', sendData, this.moveNpc.bind(this));
		}
		else {
			this.battleTimer = setTimeout(this.findHexIdToMove().bind(this), 500);
		}
	}
};


/*
	* Description: Moving npc
	*	@hexesArray
	*	
	*
	* @since  02.04.16
	* @author pcemma
*/
Npc.prototype.moveNpc = function(hexesArray) {
	if(hexesArray.length >= 1) {
		//TODO: переделать механизм выбора гекса для передвижения, в данный момент это просто любая свободная ячейка.
		var hexToMoveId = Math.floor((Math.random() * hexesArray.length));
		eventEmitter.emit('battleMoveHero', {id: this.userData.battleId, hexId: hexesArray[hexToMoveId], userId: this.userId});
		// battlesManager.moveHero({id: this.userData.battleId, hexId: hexesArray[hexToMoveId], userId: this.userId});			
		this.battleTimer = setTimeout(this.searchEnemyInArea.bind(this), this.userData.stats.moveActionTime * 1000);								
	}
	else {
		// Свободных гексов нет. Надо заново проверить область на поиск врага. 
		// Используем moveActionTime, потому что дейсвтие должно быть сделано по таймеру движения. 
		this.battleTimer = setTimeout(this.searchEnemyInArea().bind(this), this.userData.stats.hitActionTime * 1000);
	}
};


/*
	* Description: npc tries to hit enemy
	*	@hexesArray
	*	
	*
	* @since  09.04.16
	* @author pcemma
*/
Npc.prototype.tryToHitNpc = function(hexesArray) {
	// Проверяем вернулся ли нам массив. Если нет, то боя такого нет, нам более нет надобности заводить таймеры для нпц.
	if(hexesArray) {
		// Проверка на количество гексов с врагами.
		if(hexesArray.length >= 1) {
			// Нашли врагов. 
			// TODO: Надо сделать проверку на поиск врага, самого близкого к герою.
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
	// TODO: озмжно тут надо сделать проверку на точто вооббще хоть что то у нас есть. Бой, нпц но тут явно надо
	var sendData = {
		id: this.userData.battleId, 
		hexId: this.userData.enemyHexId, 
		userId: this.userId
	};
	eventEmitter.emit("battleHeroMakeHit", sendData);
};


/*
	* Description:
	*	Repeat action hit enemy
	*	
	*
	* @since  10.04.16
	* @author pcemma
*/
Npc.prototype.repeatMakeHitListener = function() {
	this.battleTimer = setTimeout(this.heroMakeHit.bind(this), this.userData.stats.hitActionTime * 1000);
};


/*
	* Description:
	*	Repeat action search enemy enemy
	*	
	*
	* @since  10.04.16
	* @author pcemma
*/
Npc.prototype.repeatSearchEnemyListener = function() {
	this.battleTimer = setTimeout(this.searchEnemyInArea.bind(this), this.userData.stats.hitActionTime * 1000);
};

module.exports = Npc;
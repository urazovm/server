console.log("BattleManagerClass CLASS is connected");	

var async = require("async"),
	Mongo = require("./MongoDBClass.js"),
	GLOBAL = require("./PreloadDataClass.js"),
	BattleClass	= require("./BattleClass.js"),
	eventEmitter = require("./EventEmitterClass");

function BMClass() {
	
};


/*
	* Description:
	*	function initialization of the battle manager
	*	
	*
	*
	* @since  06.03.16
	* @author pcemma
*/
BMClass.prototype.initialize = function(callback)
{
	this.battles = {};
	// TODO: Need rebuild this. It's only for test!
	this.deleteAllNotEndedBattles();

	eventEmitter.on("enterBattle", this.enterBattle.bind(this));
	eventEmitter.on("battleMoveHero", this.moveHero.bind(this));
	eventEmitter.on("battleHeroMakeHit", this.heroMakeHit.bind(this));
	
	eventEmitter.on("endBattle", this.endBattleListener.bind(this));
	eventEmitter.on("battleSearchFreeHexesInArea", this.searchFreeHexesInAreaListener.bind(this));
	eventEmitter.on("battleSearchEnemyInArea", this.searchEnemyInAreaListener.bind(this));
	
	callback();
}



/*
	* Description:
	*	function Создает новую битву.
	*	
	*
	*
	* @since  20.08.15
	* @author pcemma
*/
/*
BMClass.prototype.createBattle = function(callback)
{
	var battle = new Battle(),
		queues = [
			battle.create.bind(battle),
			this.addBattleToGlobalArray.bind(this, battle)
		];
	
	async.waterfall(
		queues,
		function(err) {
			console.log("Battle is created!");
			console.log(this.battles);
			callback();
		}
	)
}
*/

/*
	* Description:
	*	function Добавляет бой в глобальный массив 
	*	
	*	@battle: object, type Battle
	*
	*
	* @since  19.08.15
	* @author pcemma
*/
BMClass.prototype.addBattleToGlobalArray = function(battle, callback) {
	console.log("addBattleToGlobalArray");
	this.battles[battle.id] = battle;
	callback();
};


/*
	* Description:
	*	function вход в битву 
	*		@data: array
	*			@id: 			str, ид боя
	*			@hero:			obj, объект пользователя
	*			@teamId:		str, ид команды в которой будет игрок!
	*			@battleType:	str, тип боя - временно! TODO: remove this!
	*
	* @since  31.01.15
	* @author pcemma
*/
BMClass.prototype.enterBattle = function(data) {
	var queues = [],
		battle = {};
	if(this.isBattleExist(data)) {
		console.log("enterBattle 1");
		battle = this.battles[data.id];
		queues.push(battle.addHero.bind(battle, data));
	}
	else if(Object.keys(this.battles).length === 0) {
		console.log("enterBattle 2");
		battle = new BattleClass();
		queues.push(battle.create.bind(battle));
		queues.push(this.addBattleToGlobalArray.bind(this, battle));
		queues.push(battle.addHero.bind(battle, data));
		
		//TODO: временно добавляем нпц в бой сразу за героем. Для тестов и показа издателю.
		// добавляем первого нпц тупо.
		if(data.battleType === "npc") {
			var npcsIdArray = ["55d20675e8e93ce757cc5688", "55d20675e8e93ce757cc5689", "55d20675e8e93ce757cc568a"];
			// var npcsIdArray = ["55d20675e8e93ce757cc5688"];

			npcsIdArray.forEach(function(npcId) {
				//TODO: type of hero from db get and set to separate collection
				console.log("npcId", npcId);
				queues.push(battle.addHero.bind(battle, {heroType: 2, userId: npcId, teamId: '2'}));
			});

		}
	}
	else {
		// TODO: Временно для кнопки вступить в бой. Находим первый бой в который можно вступить
		console.log("enterBattle 3");
		for(var battleId in this.battles) {
			if(this.battles[battleId] && this.battles[battleId].check()) {
				queues.push(this.battles[battleId].addHero.bind(this.battles[battleId], data));
				break;
			}
		}
	}
	
	async.waterfall(
		queues,
		function(err) {
			console.log("enterBattle");
		}
	)
};


/*
	* Description: двигает героя (ползователя) в поле боя
	*	@data: arr
	*		@id: 		int, ид боя
	*		@hexId: 	str, вида x.y
	*		@userId: 	str, id героя, который соверает передвижение
	*
	*
	* @since  06.02.15
	* @author pcemma
*/
BMClass.prototype.moveHero = function(data) {
	if(this.isBattleExist(data)) {
		var battle = this.battles[data.id];
		async.waterfall(
			[battle.moveHero.bind(battle, data)],
			function(err) {}
		);
	}
};


/*
	* Description: герой совершает удар
	*	@data: arr
	*		@id: 		int, ид боя
	*		@hexId: 	str, вида x.y
	*		@userId: 	str, id героя, который соверает передвижение
	*
	*
	* @since  25.02.15
	* @author pcemma
*/
BMClass.prototype.heroMakeHit = function(data) {
	if(this.isBattleExist(data)) {
		var battle = this.battles[data.id];
		async.waterfall(
			[battle.heroMakeHit.bind(battle, data)],
			function(err) {}
		);
	}
};





/*
	* Description: Check if data has id for battle and check is battle still exist and not ending
	*	@data: arr
	*		@id: 		int, ид боя
	*
	*
	* @since  15.03.16
	* @author pcemma
*/
BMClass.prototype.isBattleExist = function(data) {
	return (data && 
			data.id &&
			this.battles.hasOwnProperty(data.id) && 
			this.battles[data.id].check()); 
};




/*
	* Description: Очищает незакоченые бои в базе при старте сервера.
	*
	*
	* @since  08.03.15
	* @author pcemma
*/
BMClass.prototype.deleteAllNotEndedBattles = function() {
	console.log("FINISH ALL OLD BATTLES!!");
	Mongo.update({collection: 'game_Battles', insertData: {$set:{endFlag: true}}, options: {multi: true}}); 
};



/*********		LISTENERS	***********/

/*
	* Description:
	*	function Удаляет бой.
	*	
	*	@data: 		arrray,	
	*		@id: 	int, ид боя, который надо удалить
	*
	*
	* @since  07.03.15
	* @author pcemma
*/
BMClass.prototype.endBattleListener = function(data) {
	if(data && data.id) {
		delete this.battles[data.id];
	}
};	


/*
	* Description: Поиск врагов в области.
	*	@data: arr
	*		@id: 		int, ид боя
	*		@hexId: 	str, вида x.y
	*		@userId: 	str, ид героя, который запрашивает инфу про область
	*
	*
	* @since  16.05.15
	* @author pcemma
*/
BMClass.prototype.searchEnemyInAreaListener = function(data, callback) {
	if(this.isBattleExist(data)) {
		var battle = this.battles[data.id],
			hexesArray = battle.searchEnemyInArea(data);
		callback(hexesArray);
	}
};


/*
	* Description: Поиск свободных гексов в области передвижения.
	*	@data: arr
	*		@id: 		int, ид боя
	*		@hexId: 	str, вида x.y
	*		@userId: 	str, ид героя, который запрашивает инфу про область
	*	@callback: function, call back function
	*
	* @since  01.06.15
	* @author pcemma
*/
BMClass.prototype.searchFreeHexesInAreaListener = function(data, callback) {
	if(this.isBattleExist(data)) {
		var battle = this.battles[data.id],
			hexesArray = battle.searchFreeHexesInArea(data);
		callback(hexesArray);
	}
};


module.exports = new BMClass();
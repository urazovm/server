console.log("BattleClass CLASS is connected");	

var async = require("async"),
	redis = require('redis'),
	Mongo = require("./MongoDBClass.js"),
	GridClass = require("./GridClass.js"),
	UserClass = require("./UserClass.js"),
	NpcClass = require("./NpcClass.js"),
	eventEmitter = require("./EventEmitterClass");
	redisPub = redis.createClient();

function BattleClass() {
	this.__constructor();
};


/*
	* Description:
	*	function Конструктор класса.
	*	
	*
	*
	* @since  17.08.15
	* @author pcemma
*/
BattleClass.prototype.__constructor = function() {
	var currentTime = Math.floor(+new Date() / 1000);
	// this.id = battleId;
	this.startTime = currentTime;
	this.endFlag = false;

	this.grid = new GridClass();

	// this.hexes = this.createGrid();
	

	this.heroes = {};
	// массив команда. одна команда это массив ид пользователей, нпц которые в этой команде
	//TODO: Пересмотреть объект команд
	this.teams = {'1': [], '2': []};
};


/*
	* Description:
	*	function Создает новую битву.
	*	
	*
	*
	* @since  17.08.15
	* @author pcemma
*/
BattleClass.prototype.create = function(callback) {
	Mongo.insert({
		collection: "game_Battles", 
		insertData: {
			startTime: this.startTime,
			endFlag: this.endFlag,
			hexesInRow: this.grid.hexesInRow,
			hexesInCol: this.grid.hexesInCol,
			teams: this.teams
		}, 
		callback: function(rows) {
			console.log(rows);
			this.id = rows.ops[0]._id;
			callback();
		}.bind(this)
	}); 
};


/*
	* Description:
	*	function проверяет активна ли битва, и если в ней места.
	*	
	*
	*
	* @since  31.01.15
	* @author pcemma
*/
BattleClass.prototype.check = function() {
	// TODO: нормальная проверка, на свободные места, и прочее
	if(	
		!this.endFlag
	) {
		return true;
	}
	return false;
};


/*
	* Description:
	*	function check if one of the team is dead
	*	
	*
	*
	* @since  19.03.16
	* @author pcemma
*/
BattleClass.prototype.checkEndOfBattle = function() {
	console.log("CHECK IF HEROES ARE DAED!");
	if(!this.isAliveHeroesInTeam(1)) {
		console.log("DONT OPEN!! DEAD INSIDE!!!");
		this.completion({winTeamId: 2});	
	} else if(!this.isAliveHeroesInTeam(2)) {
		console.log("DONT OPEN!! DEAD INSIDE!!!");
		this.completion({winTeamId: 1});	
	}
};


/*
	* Description:
	*	function Заканчивает бой
	*	
	*	@data: array
	*		@winTeamId: int, ид команды,которая выиграла бой
	*
	*
	* @since  06.03.15
	* @author pcemma
*/
BattleClass.prototype.completion = function(data) {	
	//TODO: Надо переделать async плюс ответы каждому о его статах и данныхпосле боя

	// 1. Пройтись по всем юзерам и поставить что они не в бою. 
	for (var heroId in this.heroes) {
		this.heroes[heroId].removeFromBattle();
	}
	
	
	this.sendData(this.getAllHeroesId(), {
		f: "battleCompletion", 
		p: {
			winTeamId: data.winTeamId
		}
	});
	
	// TODO: Статистика
	
	// Обновление таблиц
	Mongo.update({collection: 'game_Battles', searchData: {_id: this.id}, insertData: {$set: {endFlag: true}}});			
	
	eventEmitter.emit("endBattle", {id: this.id});
};




/*
	* Description:
	*	function Добавляет героя в битву
	*	@data: obj
	*		@hero:		obj, Объект пользователя, либо объект нпц который предварительно создан
	*		@teamId:	str, номер команды в которую, надо занести героя
	*
	* @since  31.01.15
	* @author pcemma
*/
BattleClass.prototype.addHero = function(data, callback) {
	var heroId = data.userId,
		queues = [];

	console.log("SEND DATA");
	// отправляем пользователю, те данные что уже есть. положение всех воинов на поле боя
	//TODO: возможноне стоит сразу слать а как то проверить userId
	this.sendData([heroId], {
		f: "battleCreate", 
		p: this.getBattleStatus()
	});

	if(!this.isHeroExistInBattle(heroId)) {
		var hero = new UserClass(),
			tempTeamId = this.addHeroToTeamArray({teamId: data.teamId, heroId: heroId}),
			hexId = this.getStartedCoordinats(tempTeamId);
		
		hero.userId = heroId;
		this.heroes[hero.userId] = hero;

		queues.push(hero.getUserData.bind(hero)); 
		
		// Обновление гекса
		queues.push(this.grid.addHeroToHex.bind(this.grid, {userId: heroId, hexId: hexId})); 
		
		// Тут апдейта массива юзера с данными о битве
		queues.push(hero.addToBattle.bind(hero, {
			inBattleFlag: true,
			battleId: 	this.id,
			teamId: 	tempTeamId,
			hexId: 		hexId
		})); 
	}

	async.waterfall(
		queues,
		function(err) {
			console.log("CALL BACK ADD HERO!!!!!");
			// тут должна отправляться вся инфа о пользователе. ид, логин, вещи, хп, манна,на какой позиции, команда, 
			this.sendData(this.getAllHeroesId(), {
				f: "battleAddHero", 
				p: this.getHeroData(heroId)
			});
			callback();
		}.bind(this)
	);
};


/*
	* Description: add hero to to team array.
	*	@data: arr
	*		@heroId: str, id of the heroe
	*		@teamId: str, id of the team
	*
	* @since  19.03.16
	* @author pcemma
*/
BattleClass.prototype.addHeroToTeamArray = function(data) {
	var heroId = data.heroId,
		teamId = data.teamId, 
		newTeamId = '2';

	// TODO: remove -> это времено, раскидываем по одному в команду.
	if((this.teams['1'].length <= this.teams['2'].length && !teamId) || teamId === 1) {
		newTeamId = '1';
	}
	this.teams[newTeamId].push(heroId);
	return parseInt(newTeamId);
};


/*
	* Description: get started cooridnats.
	*		@teamId: str, id of the team
	*
	* @since  19.03.16
	* @author pcemma
*/
BattleClass.prototype.getStartedCoordinats = function(teamId) {
	var x = (teamId === 1) ? 0 : 6, 
		y = Math.floor(Math.random() * (4 + 1)),
		hexId = x+"."+y;
	// TODO: add check for obstructions hexes
	return hexId;
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
BattleClass.prototype.moveHero = function(data, callback) {
	var heroId = data.userId,
		hexId = data.hexId,
		queues = [];
	console.log("moveHero", heroId);

	if(
		// Проверяем на то есть ли вообще такой герой у нас И может ли он совершать действие
		this.heroes[heroId] && 										
		this.heroes[heroId].isReadyForAction({battleId: this.id}) &&
		this.grid.canHeroMoveToHex({hexId: hexId, currentHexId: this.heroes[heroId].userData.hexId, radius: this.heroes[heroId].userData.stats.moveRadius})
	) {
		var grid = this.grid,
			hero = this.heroes[heroId];
		
		// Обновление гекса
		queues.push(grid.addHeroToHex.bind(grid, {userId: heroId, hexId: hexId})); 
		queues.push(grid.removeHeroFromHex.bind(grid, hero.userData.hexId)); 

		// Обновление героя
		queues.push(hero.setBattleData.bind(hero, {hexId: hexId, action: "move"}));
	
		async.waterfall(
			queues,
			function(err) {
				console.log("CALL BACK MOVE HERO!!!!!");
				this.sendData(this.getAllHeroesId(), {
					f: "battleMoveHero", 
					p: {
						userId: heroId,
						hexId: hexId
					}
				});
				callback();
			}.bind(this)
		);
	}
};


/*
	* Description: Производит удар
	*	@data: arr
	*		@id: 		int, ид боя
	*		@hexId: 	str, вида x.y
	*		@userId: 	str, id героя, который соверает передвижение
	*
	*
	* @since  25.02.15
	* @author pcemma
*/
BattleClass.prototype.heroMakeHit = function(data, callback) {
	var heroId = data.userId,
		queues = [];

	if(
		// Проверяем на то есть ли вообще такой герой у нас И может ли он совершать действие
		this.isHeroExistInBattle(heroId) && 										
		this.heroes[heroId].isReadyForAction({battleId: this.id}) &&
		this.grid.canHeroAttackHex({hexId: data.hexId, currentHexId: this.heroes[heroId].userData.hexId, radius: this.heroes[heroId].userData.stats.attackRadius})
	) {		 
		//Берем ид героя(противника) в гексе
		var oponentHeroId = this.grid.getUserIdInHex(data.hexId);
		
		if(
			// Доступен ли игрок для действий
			this.isHeroExistInBattle(oponentHeroId) && 
			this.heroes[oponentHeroId].isAvailableEnemy({battleId: this.id, teamId: this.heroes[heroId].userData.teamId}) 	
		) {
			var hero = this.heroes[heroId],
				oponentHero = this.heroes[oponentHeroId],
				// TODO: make async!!! Считаем урон противнику.
				damage = hero.countDamage();
			
			// обновляем герою который совершал удар время таймаута
			queues.push(hero.setBattleData.bind(hero, {action: 'hit'}));
			
			//TODO: считать увернулся ли противник
			
			//TODO: посчитать броню противника

			// Обновляем противнику его текущее значение хп
			queues.push(oponentHero.getDamage.bind(oponentHero, damage));

			queues.push(this.checkHeroDead.bind(this, oponentHeroId));

			async.waterfall(
				queues,
				function(err) {
					this.sendData(this.getAllHeroesId(), {
						f: "battleHeroMakeHit", 
						p: {
							userId: heroId,
							oponentUserId: oponentHeroId,
							damage: damage
						}
					});

					// Check if someone was killed 
					console.log("oponentHero.isAlive()", oponentHero.isAlive());
					if(!oponentHero.isAlive()) {
						this.checkEndOfBattle();
					}
					callback();
				}.bind(this)
			);
		}
	}
};






/*
	* Description: is user exist in current battle
	*		@heroId: 	str, id hero to check
	*
	*
	* @since  19.03.16
	* @author pcemma
*/
BattleClass.prototype.isHeroExistInBattle = function(heroId) {
	console.log("\n\n\n\n HERO EXIST: ", heroId, this.heroes.hasOwnProperty(heroId), "\n\n\n\n");
	return this.heroes.hasOwnProperty(heroId);
};






/*
	* Description:
	*	function получаем все данные про бой в текущий момент
	*	
	*
	*
	* @since  31.01.15
	* @author pcemma
*/
BattleClass.prototype.getBattleStatus = function() {
	var battleInfo = {
		id: 				this.id,
		heroes: 			this.getHeroesData(),
		obstructionsHexes: 	this.grid.obstructionsHexes,
		teams:				this.teams	
	};
	
	return battleInfo;
};


/*
	* Description:
	*	function получаем все данные про всех героев
	*		
	*
	*
	* @since  19.09.15
	* @author pcemma
*/
BattleClass.prototype.getHeroesData = function() {
	var heroes = {};
	for (var i in this.heroes) {
		heroes[i] = this.getHeroData(i);
	}
	return heroes;
};


/*
	* Description:
	*	function получаем все данные про героя, которые отправляются в бой
	*	
	*	@userId:	int, id героя(пользователя)	
	*
	*
	* @since  21.02.15
	* @author pcemma
*/
BattleClass.prototype.getHeroData = function(userId) {
	return this.heroes[userId].getUserDataForBattle();
};


/*
	* Description: Check if hero dead. It true need to remove hero from the battle field
	*
	*
	*
	* @since  19.03.16
	* @author pcemma
*/
BattleClass.prototype.checkHeroDead = function(heroId, callback) {
		var hero = this.heroes[heroId],
			isHeroDead = !hero.isAlive();
		// if dead need remove from hex
		if(isHeroDead) {
			async.waterfall(
				[this.grid.removeHeroFromHex.bind(this.grid, hero.userData.hexId)],
				function(err) { callback(); }
			);
		} else {
			callback();
		}
};


/*
	* Description: Проверка на то что в одной из команд есть ли живые игроки еще.
	*
	*	@teamId: int, ид команды в которой надо проверить есть ли еще живой игрок
	*
	*	@return:	true - если в команде еще есть живые игроки / false - если в команде живых не осталось
	*
	* @since  01.03.15
	* @author pcemma
*/
BattleClass.prototype.isAliveHeroesInTeam = function(teamId) {
	this.teams[teamId].forEach(function(heroId) {
		if(this.heroes[heroId].isAlive()) {
			return true;
		}
	}.bind(this));
	return false;
};







/*
	* Description:
	*	function Поиск врагов в области удара игрока.
	*	
	*	@data: array
	*		@hexId: str, ид гекса центра области. Гекса в котором находится герой.
	*		@userId: str, ид героя, который запрашивает информацию по области.
	*
	* @since  16.05.15
	* @author pcemma
*/
BattleClass.prototype.searchEnemyInArea = function(data) {
	return this.grid.searchEnemyInArea({
		hexId: data.hexId, 
		checkHero: function(oponentUserId) {
			return 	this.heroes[oponentUserId] && 
					this.heroes[oponentUserId].isAvailableEnemy({battleId: this.id, teamId: this.heroes[data.userId].userData.teamId});
		}
	});
};


/*
	* Description:
	*	function Поиск свободных ячеек в области.
	*	
	*	@data: array
	*		@hexId: str, ид гекса центра области. Гекса в котором находится герой.
	*		@userId: str, ид героя, который запрашивает информацию по области.
	*
	* @since  01.06.15
	* @author pcemma
*/
BattleClass.prototype.searchFreeHexesInArea = function(data) {
	return this.grid.searchFreeHexesInArea(data);
};











/*
	* Description:
	*	function get all heroes id in battle.
	*	
	*	return array
	*
	* @since  31.01.15
	* @author pcemma
*/
BattleClass.prototype.getAllHeroesId = function() {
	var heroesIdArr = [];
	for(var i in this.heroes) {
		heroesIdArr.push(i);
	}
	return heroesIdArr;
};


/*
	* Description:
	*	function делает рассылку команды всем ползователям которые находятся в том бою.
	*	
	*	
	*
	* @since  31.01.15
	* @author pcemma
*/
BattleClass.prototype.sendData = function(usersIdArr, data) {
	var channel = "battle_client";
	redisPub.publish(channel, JSON.stringify({f: 'sendDataToUsers', p: {usersIdArr: usersIdArr, data: data}}));
};


module.exports = BattleClass;
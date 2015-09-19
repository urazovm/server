console.log("BattleClass CLASS is connected");	

function BattleClass() {
	this.__constructor();
}


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
}


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
}


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
}


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
	// 1. Пройтись по всем юзерам и поставить что они не в бою. 
	for (var heroId in this.heroes) {
		this.heroes[heroId].removeFromBattle();
	}
	
	
	this.socketWrite({
						f: "battleCompletion", 
						p: {
							winTeamId: data.winTeamId
						}
					});
	
	// TODO: Статистика
	
	// Обновление таблиц
	Mongo.update({collection: 'game_Battles', searchData: {_id: this.id}, insertData: {$set: {endFlag: true}}});			
	
	//TODO: Пересмотреть механизм удаления боя
	battlesManager.removeBattle({id: this.id});
}




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
	var hero = data.hero;
	// отправляем пользователю, те данные что уже есть. положение всех воинов на поле боя
	hero.socketWrite({
						f: "battleCreate", 
						p: this.getBattleStatus()
					});
	
	// TODO: если такой герой есть, то скорее всего это повторное подключение. Переопределить сокет ??
	if(!(hero.userId in this.heroes)) {
	
		var tempTeamId = 1,
			hexId = "0.0";
			
			
		this.heroes[hero.userId] = hero;
		
		// TODO: remove -> это времено, раскидываем по одному в команду.
		if((this.teams['1'].length <= this.teams['2'].length && !data.teamId) || data.teamId === 1) {
			this.teams['1'].push(hero.userId);
			var x = 0,
				y = Math.floor(Math.random() * (4 + 1));
			hexId = x+"."+y;
		}
		else {
			this.teams['2'].push(hero.userId);
			tempTeamId = 2;
			var x = 6,
				y = Math.floor(Math.random() * (4 + 1));
			hexId = x+"."+y;
		}
		
		// Обновление гекса
		this.grid.addHeroToHex({userId: hero.userId, hexId: hexId});
		
		// Тут апдейта массива юзера с данными о битве
		this.heroes[hero.userId].addToBattle({
												battleId: 	this.id,
												teamId: 	tempTeamId,
												hexId: 		hexId
											});
		
		
		// тут должна отправляться вся инфа о пользователе. ид, логин, вещи, хп, манна,на какой позиции, команда, 
		this.socketWrite({
							f: "battleAddHero", 
							p: this.getHeroData(hero.userId)
						});
	}
	callback();
}


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
BattleClass.prototype.moveHero = function(data) {
	console.log("moveHero", data.userId);
	
	if(
		// Проверяем на то есть ли вообще такой герой у нас И может ли он совершать действие
		this.heroes[data.userId] && 										
		this.heroes[data.userId].isReadyForAction({battleId: this.id}) &&
		this.grid.canHeroMoveToHex({hexId: data.hexId, currentHexId: this.heroes[data.userId].userData.hexId})
	) {
		// Обновление гекса
		this.grid.addHeroToHex({userId: data.userId, hexId: data.hexId});
		this.grid.removeHeroFromHex(this.heroes[data.userId].userData.hexId);
		
		
		// Обновление героя
		this.heroes[data.userId].userData.hexId = data.hexId;
		this.heroes[data.userId].setLastActionTime('move');
		
		this.socketWrite({
							f: "battleMoveHero", 
							p: {
								userId: data.userId,
								hexId: data.hexId
							}
						});
		return true;
	}
	return false;
}


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
BattleClass.prototype.heroMakeHit = function(data) {
	var currentTime = Math.floor(+new Date() / 1000);
	
	if(
		// Проверяем на то есть ли вообще такой герой у нас И может ли он совершать действие
		this.heroes[data.userId] && 										
		this.heroes[data.userId].isReadyForAction({battleId: this.id}) &&
		this.grid.canHeroAttackHex({hexId: data.hexId, currentHexId: this.heroes[data.userId].userData.hexId})
	) {		 
		//Берем ид героя(противника) в гексе
		var oponentUserId = this.grid.getUserIdInHex(data.hexId);
		
		if(
			// Доступен ли игрок для действий
			this.heroes[oponentUserId] && 
			this.heroes[oponentUserId].isAvailableEnemy({battleId: this.id, teamId: this.heroes[data.userId].userData.teamId}) 	
		) {
			// обновляем герою который совершал удар время таймаута
			this.heroes[data.userId].setLastActionTime('hit');
			
			//TODO: считать увернулся ли противник
		
			// Считаем урон противнику.
			var damage = this.heroes[data.userId].countDamage();
			
			//TODO: посчитать броню противника
			
			console.log("damage", damage, "oponentUserId", oponentUserId, "this.heroes[oponentUserId].userData.stats.currentHp", this.heroes[oponentUserId].userData.stats.currentHp);
			
			// Обновляем противнику его текущее значение хп
			this.heroes[oponentUserId].userData.stats.currentHp -= damage;
			
			// Проверяет умер ли герой. Если да, то ставит герою соответствующие флаги
			var isHeroAlive = this.heroes[oponentUserId].isAlive();
			// Проверяем если герой умер то надо удалить его из гекса.
			if(!isHeroAlive) {
				this.grid.removeHeroFromHex(this.heroes[oponentUserId].userData.hexId);
			}
			
			this.socketWrite({
								f: "battleHeroMakeHit", 
								p: {
									userId: data.userId,
									oponentUserId: oponentUserId,
									damage: damage
								}
							});
			
			// Проверяет остались ли в команде героя по которому нанесли урон живые. 
			// Если живых нет, то надо закончить бой
			if(!isHeroAlive && !this.isAliveHeroesInTeam(this.heroes[oponentUserId].userData.teamId)) {
				console.log("DONT OPEN!! DEAD INSIDE!!!");
				this.completion({
									winTeamId: (this.heroes[oponentUserId].userData.teamId === 1) ? 2 : 1 
								});
			}
			return true;
		}
	}
	return false;
}











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
}


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
}






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
		heroes: 			{},
		obstructionsHexes: 	this.grid.obstructionsHexes,
		teams:				this.teams	
	};
	
	
	for (var i in this.heroes) {
		battleInfo.heroes[i] = this.getHeroData(i);
	}
	
	return battleInfo;
}


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
}


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
	for(var heroId in this.teams[teamId]) {
		if(this.heroes[this.teams[teamId][heroId]].isAlive()) {
			return true;
		}
	}
	return false;
}
















/*
	* Description:
	*	function делает рассылку команды всем ползователям которые находятся в том бою.
	*	
	*	
	*
	* @since  31.01.15
	* @author pcemma
*/
BattleClass.prototype.socketWrite = function(data) {
	// console.log("\n\n BattleClass.prototype.socketWrite");
	for(var i in this.heroes) {
		// console.log("heroId", i);
		this.heroes[i].socketWrite(data);
	}
	// console.log("--------------- \n\n");
}


module.exports = BattleClass;
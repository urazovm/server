console.log("BattleClass CLASS is connected");	

function BattleClass() {

	
	/*
		* Description:
		*	function Создает новую битву.
		*	
		*
		*
		* @since  31.01.15
		* @author pcemma
	*/
	BattleClass.prototype.create = function()
	{
		var currentTime = Math.floor(+new Date() / 1000),
			battleId = SQL.lastInsertIdSync("INSERT INTO `game_Battles` (`id`, `startTime`) VALUES (NULL, "+currentTime+")");
			
		

		this.id = battleId;
		this.startTime = currentTime;
		this.endFlag = 0;
		this.hexesInRow = 8;
		this.hexesInCol = 7;
		this.obstructionsHexes = this.createobstructionsHexes();
		this.hexes = this.createGrid();
		this.heroes = {};
		// массив команда. одна команда это массив ид пользователей, нпц которые в этой команде
		this.teams = {'1': [], '2': []};

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
	BattleClass.prototype.check = function()
	{
		// TODO: нормальная проверка, на свободные места, и прочее
		if(	
			
			this.endFlag == 0
		){
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
	BattleClass.prototype.completion = function(data)
	{
		console.log("\n B completion");
		console.log(data);
		
		// 1. Пройтись по всем юзерам и поставить что они не в бою. 
		for (var heroId in this.heroes){
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
		SQL.querySync("UPDATE `game_Battles` SET `game_Battles`.`endFlag` = 1 WHERE `game_Battles`.`id` = "+this.id);				
		
		//TODO: Пересмотреть механизм удаления боя
		battlesManager.removeBattle({id: this.id});
	}
	
	
	
	
	/*
		* Description:
		*	function Добавляет героя в битву
		*	
		*	@hero:	obj, Объект пользователя, либо объект нпц который предварительно создан
		*
		* @since  31.01.15
		* @author pcemma
	*/
	BattleClass.prototype.addHero = function(hero)
	{
		// отправляем пользователю, те данные что уже есть. положение всех воинов наполе боя
		hero.socketWrite({
							f: "battleCreate", 
							p: this.getBattleStatus()
						});
		
		// TODO: если такой герой есть, то скорее всего это повторное подключение. Перепоределить сокет ??
		if(!this.heroes[String(hero.userId)] || lib.objectSize(this.heroes[String(hero.userId)]) <= 0){
		
			var teamId = 1,
				hexId = "0.0";
				
				
			this.heroes[String(hero.userId)] = hero;
			
			// это времено, раскидываем по одному в команду.
			if(this.teams['1'].length <= this.teams['2'].length){
				this.teams['1'].push(String(hero.userId));
				var x = 0,
					y = Math.floor(Math.random() * (4 + 1));
				hexId = x+"."+y;
			}
			else{
				this.teams['2'].push(String(hero.userId));
				teamId = 2;
				var x = 6,
					y = Math.floor(Math.random() * (4 + 1));
				hexId = x+"."+y;
			}
			
			
			// Обновление гекса
			this.hexes[hexId].addHero({userId: hero.userId});
			
			// Тут апдейта массива юзера с данными о битве
			this.heroes[String(hero.userId)].addToBattle({
															battleId: 	this.id,
															teamId: 	teamId,
															hexId: 		hexId
														});
			
			
			// тут должна отправляться вся инфа о пользователе. ид, логин, вещи, хп, манна,на какой позиции, команда, 
			this.socketWrite({
								f: "battleAddHero", 
								p: this.getHeroData(hero.userId)
							});
		}
	}
	
	
	/*
		* Description: двигает героя (ползователя) в поле боя
		*	@data: arr
		*		@id: 		int, ид боя
		*		@hexId: 	str, вида x.y
		*
		*
		* @since  06.02.15
		* @author pcemma
	*/
	BattleClass.prototype.moveHero = function(data)
	{
		var currentTime = Math.floor(+new Date() / 1000);
		
		console.log("\n B moveHero");
		console.log(data);
			
		if(
			this.heroes[data.userId] && 										// Проверяем на то есть ли вообще такой герой у нас
			this.heroes[data.userId].userData.inBattleFlag && 					// Проверяем на то что герой этот в бою
			this.heroes[data.userId].userData.battleId == this.id &&			// Проверка что герой в этом самом бою
			this.heroes[data.userId].isAlive() &&								// живой ли герой, мертвые не ходят!
			this.heroes[data.userId].userData.lastActionTime <= currentTime && 	// Проверка на возможность делать ход, не включен ли таймаут
			this.hexes[data.hexId] && 											// Проверяем на то что такой гекс вообще есть!
			this.hexes[data.hexId].isFree && 									// Проверка на то что гекс в который хотят передвинуть свободен
			this.hexes[this.heroes[data.userId].userData.hexId].isNeighbor({x: this.hexes[data.hexId].x, y: this.hexes[data.hexId].y}) // и находится в радиусе шага
		){
			
			// Обновление гекса
			this.hexes[data.hexId].addHero({userId: data.userId});
			this.hexes[this.heroes[data.userId].userData.hexId].removeHero();
			
			// Обновление героя
			this.heroes[data.userId].userData.hexId = data.hexId;
			this.heroes[data.userId].userData.lastActionTime = currentTime + this.heroes[data.userId].userData.moveActionTime;
			
			this.socketWrite({
								f: "battleMoveHero", 
								p: {
									userId: String(data.userId),
									hexId: data.hexId
								}
							});
		}
	}
	
	
	/*
		* Description: Производит удар
		*	@data: arr
		*		@id: 		int, ид боя
		*		@hexId: 	str, вида x.y
		*
		*
		* @since  25.02.15
		* @author pcemma
	*/
	BattleClass.prototype.heroMakeHit = function(data)
	{
		var currentTime = Math.floor(+new Date() / 1000);
		
		console.log("\n B heroMakeHit");
		console.log(data);
	
		// TODO: переделать проверку соседей на проверку в радиусе
		
		if(
			this.heroes[data.userId] && 										// Проверяем на то есть ли вообще такой герой у нас
			this.heroes[data.userId].userData.inBattleFlag && 					// Проверяем на то что герой этот в бою
			this.heroes[data.userId].userData.battleId == this.id &&			// Проверка что герой в этом самом бою
			this.heroes[data.userId].isAlive() &&								// живой ли герой, мертвые не сражаются!
			this.heroes[data.userId].userData.lastActionTime <= currentTime && 	// Проверка на возможность делать удар, не включен ли таймаут
			this.hexes[data.hexId] && 											// Проверяем на то что такой гекс вообще есть!
			this.hexes[this.heroes[data.userId].userData.hexId].isNeighbor({x: this.hexes[data.hexId].x, y: this.hexes[data.hexId].y}) && // и находится в радиусе удара
			this.hexes[data.hexId].userId										// Проверяем на то что в этом гексе есть герой
		){		 
			//Берем ид героя(противника) в гексе
			var oponentUserId = this.hexes[data.hexId].userId;
			
			if(
				this.heroes[oponentUserId] && 								// Проверяем на то есть ли вообще такой герой у нас
				this.heroes[oponentUserId].userData.inBattleFlag && 		// Проверяем на то что герой этот в бою
				this.heroes[oponentUserId].userData.battleId == this.id &&	// Проверка что герой в этом самом бою
				this.heroes[oponentUserId].isAlive() &&						// живой ли герой, мертвых не бьют!
				this.heroes[oponentUserId].userData.teamId != this.heroes[data.userId].userData.teamId	// противник ли в этой клетке?
			){
				// обновляем герою который совершал удар время таймаута
				this.heroes[data.userId].userData.lastActionTime = currentTime + this.heroes[data.userId].userData.moveActionTime;
				
				//TODO: считать увернулся ли противник
			
				// Считаем урон противнику.
				var damage = this.heroes[data.userId].countDamage();
				
				//TODO: посчитать броню противника
				
				console.log("damage", damage, "oponentUserId", oponentUserId, "this.heroes[oponentUserId].userData.currentHp", this.heroes[oponentUserId].userData.currentHp);
				
				// Обновляем противнику его текущее значение хп
				this.heroes[oponentUserId].userData.currentHp -= damage;
				// Проверяет умер ли герой. Если да, тоставит герою соответствующие флаги
				var isHeroAlive = this.heroes[oponentUserId].isAlive();
				// Проверяем если герой умер то надо удалить его из гекса.
				if(!isHeroAlive){
					this.hexes[this.heroes[oponentUserId].userData.hexId].removeHero();
				}
				
				this.socketWrite({
									f: "battleHeroMakeHit", 
									p: {
										userId: String(data.userId),
										oponentUserId: String(oponentUserId),
										damage: damage
									}
								});
				
				// Проверяет остались ли в команде героя по которому нанесли урон живые. 
				// Если живых нет, то надо закончить бой
				if(!isHeroAlive && !this.isAliveHeroesInTeam(this.heroes[oponentUserId].userData.teamId)){
					console.log("DONT OPEN!! DEAD INSIDE!!!");
					this.completion({
										winTeamId: (this.heroes[oponentUserId].userData.teamId == 1) ? 2 : 1 
									});
				}
			}
		}
	}
	
	

	
	
	
	/*
		* Description:
		*	function создает массив непроходимых гексов с препятствиями
		*	
		*
		*
		* @since  14.02.15
		* @author pcemma
	*/
	BattleClass.prototype.createobstructionsHexes = function()
	{
		var tmpArray = {};
		for (var i= 1; i <= Math.floor(Math.random() * (3 - 1 + 1)) + 1; i++ ){
			var x = Math.floor(Math.random() * (this.hexesInRow + 1)),
				y = Math.floor(Math.random() * (this.hexesInCol + 1));
			tmpArray[x+"."+y] = String(Math.floor(Math.random() * (lib.objectSize(GLOBAL.DATA.battleInfo.obstructions) - 1 + 1)) + 1);
		}
		return tmpArray;
	}
	
	
	/*
		* Description:
		*	function создает массив гексов
		*	
		*
		*
		* @since  31.01.15
		* @author pcemma
	*/
	BattleClass.prototype.createGrid = function()
	{
		var tmpArray = {};
		for (var i = 1; i <= this.hexesInRow; i++){
			for (var j = 1; j <= this.hexesInCol; j++){
				var x = i - 1,
					y = j - 1;
					dy = Math.fmod(y, 2),
					isObstruction = (this.obstructionsHexes[x+"."+y]) ? true : false; // Флаг определяет будет ли на эом гексе препятствие
				
				if(!(dy == 1 && i == this.hexesInRow)){ // не рисуем в четных рядах последний гекс для красивого отображения сетки
					tmpArray[x+"."+y] = new HexagonClass({x: x, y: y, isObstruction: isObstruction});
				}
			}
		}
		return tmpArray;
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
	BattleClass.prototype.getBattleStatus = function()
	{
		var battleInfo = {
			id: 				this.id,
			heroes: 			{},
			obstructionsHexes: 	this.obstructionsHexes,
			teams:				this.teams	
		};
		
		
		for (var i in this.heroes){
			console.log("i", i);
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
	BattleClass.prototype.getHeroData = function(userId)
	{
		var currentTime = Math.floor(+new Date() / 1000);
			info = {
						id: 			String(this.heroes[userId].userId),
						teamId: 		this.heroes[userId].userData.teamId,
						isAliveFlag:	this.heroes[userId].userData.isAliveFlag,
						hexId: 			this.heroes[userId].userData.hexId,
						login: 			this.heroes[userId].userData.login,
						hp:				this.heroes[userId].userData.hp,
						currentHp:		this.heroes[userId].userData.currentHp,
						lastActionTime: (currentTime < this.heroes[userId].userData.lastActionTime) ? (this.heroes[userId].userData.lastActionTime - currentTime) : 0
					};
		return info;
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
	BattleClass.prototype.isAliveHeroesInTeam = function(teamId)
	{
		for (var heroId in this.teams[teamId]){
			if(this.heroes[this.teams[teamId][heroId]].isAlive()){
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
	BattleClass.prototype.socketWrite = function(data)
	{
		console.log("\n\n BattleClass.prototype.socketWrite");
		for(var i in this.heroes){
			console.log("heroId", i);
			this.heroes[i].socketWrite(data);
		}
		console.log("--------------- \n\n");
	}
	
	
	
	
	
	this.create();
}



module.exports = BattleClass;
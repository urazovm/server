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
		var currentTime = + new Date(),
			// battleId = SQL.lastInsertIdSync("INSERT INTO `game_Battles` (`id`, `startTime`) VALUES (NULL, "+currentTime+")");
			battleId = 1;
		

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
		if(this.endFlag == 0){
			return true;
		}
		return false;
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
			this.heroes[String(hero.userId)].battleId = this.id;
			this.heroes[String(hero.userId)].teamId = teamId;
			this.heroes[String(hero.userId)].hexId = hexId;
			
			
			
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
		var currentTime = + new Date();
		
		console.log("\n B moveHero");
		console.log(data);
		// TODO: живой ли герой, мертвые не ходят!
		
		if(
			this.hexes[data.hexId] && // Проверяем на то что такой гекс вообще есть!
			this.hexes[data.hexId].isFree && // Проверка на то что гекс в который хотят передвинуть свободен
			this.hexes[this.heroes[data.userId].hexId].isNeighbor({x: this.hexes[data.hexId].x, y: this.hexes[data.hexId].y}) && // и находится в радиусе шага
			this.heroes[data.userId].userData.lastActionTime <= currentTime // Проверка на возможность делать ход, не включен ли таймаут
		){
			
			// Обновление гекса
			this.hexes[data.hexId].addHero({userId: data.userId});
			this.hexes[this.heroes[data.userId].hexId].removeHero();
			
			// Обновление героя
			this.heroes[data.userId].hexId = data.hexId;
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
		var currentTime = + new Date();
		
		console.log("\n B heroMakeHit");
		console.log(data);
		// TODO: живой ли герой, мертвые не ходят!
		// TODO: есть в ли этой клетке герой
		// TODO: противник ли в этой клетке
		// TODO: переделать проверку соседей на проверку в радиусе
		
		if(
			this.hexes[data.hexId] && // Проверяем на то что такой гекс вообще есть!
			// this.hexes[data.hexId].isFree && // Проверка на то что гекс в который хотят передвинуть свободен
			this.hexes[this.heroes[data.userId].hexId].isNeighbor({x: this.hexes[data.hexId].x, y: this.hexes[data.hexId].y}) && // и находится в радиусе удара
			this.heroes[data.userId].userData.lastActionTime <= currentTime // Проверка на возможность делать удар, не включен ли таймаут
		){
			
			// обновляем герою который совершал удар время таймаута
			this.heroes[data.userId].userData.lastActionTime = currentTime + this.heroes[data.userId].userData.moveActionTime;
			
			
			//Берем ид героя(противника) в гексе
			var oponentUserId = this.hexes[data.hexId].userId;
			
			
			//TODO: считать увернулся ли противник
			//TODO: считать урон противнику если противник не увернулся.
			
			this.socketWrite({
								f: "battleHeroMakeHit", 
								p: {
									userId: String(data.userId),
									oponentUserId: String(oponentUserId)
								}
							});
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
		var currentTime = + new Date();
			info = {
						id: 		String(this.heroes[userId].userId),
						teamId: 	this.heroes[userId].teamId,
						hexId: 		this.heroes[userId].hexId,
						login: 		this.heroes[userId].userData.login,
						hp:			this.heroes[userId].userData.hp,
						currentHp:	this.heroes[userId].userData.currentHp,
						lastActionTime: (currentTime < this.heroes[userId].userData.lastActionTime) ? (this.heroes[userId].userData.lastActionTime - currentTime) : 0
					};
		return info;
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
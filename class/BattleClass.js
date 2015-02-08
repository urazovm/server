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
		this.hexesInRow = 10;
		this.hexesInCol = 5;
		this.obstructionsHexes = {};
		for (var i= 1; i <= Math.floor(Math.random() * (3 - 1 + 1)) + 1; i++ ){
			var x = Math.floor(Math.random() * (this.hexesInRow + 1)),
				y = Math.floor(Math.random() * (this.hexesInCol + 1));
			this.obstructionsHexes[x+"."+y] = String(Math.floor(Math.random() * (lib.objectSize(GLOBAL.DATA.battleInfo.obstructions) - 1 + 1)) + 1);
		}
		
		console.log("this.obstructionsHexes",this.obstructionsHexes);
		
		this.hexes = this.createGrid();
		
		console.log(this.hexes);
		
		this.heroes = {};
		
		
	
		
		
		
		// массив команда. одна команда это массив ид пользователей, нпц которые в этой команде
		this.teams = {'1': [], '2': []};
		
		
		
		
		console.log("battleId", this.id);
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
				position = "0.0";
				
				
			this.heroes[String(hero.userId)] = hero;
			
			// это времено, раскидываем по одному в команду.
			if(this.teams[1].length <= this.teams[2].length){
				this.teams[1].push(hero.userId);
				var x = 0,
					y = Math.floor(Math.random() * (4 + 1));
				position = x+"."+y;
			}
			else{
				this.teams[2].push(hero.userId);
				teamId = 2;
				var x = 8,
					y = Math.floor(Math.random() * (4 + 1));
				position = x+"."+y;
			}
			
			
			// Обновление гекса
			this.hexes[position].addHero({userId: hero.userId});
			
			// Тут апдейта массива юзера с данными о битве
			this.heroes[String(hero.userId)].battleId = this.id;
			this.heroes[String(hero.userId)].teamId = teamId;
			this.heroes[String(hero.userId)].position = position;
			
			
			
			// тут должна отправляться вся инфа о пользователе. ид, логин, вещи, хп, манна,на какой позиции, команда, 
			this.socketWrite({
								f: "battleAddHero", 
								p: {
									id: String(hero.userId),
									teamId: teamId,
									position: position
									}
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
		// TODO: Проверка на возможность делать ход
		// TODO:  и находится в радиусе шага
		
		console.log("\n B moveHero");
		console.log(data);
		
		//Проверяем на то что такой гекс вообщеесть!
		if(
			this.hexes[data.hexId] && // Проверяем на то что такой гекс вообщеесть!
			this.hexes[data.hexId].isFree // Проверка на то что гекс в который хотят передвинуть свободен
		){
			
			// Обновление гекса
			this.hexes[data.hexId].addHero({userId: data.userId});
			this.hexes[this.heroes[data.userId].position].removeHero();
			
			this.heroes[data.userId].position = data.hexId;
			
			console.log("this.hero ", this.heroes[data.userId].position);
			console.log("USER ", GLOBAL.USERS[data.userId].position);
			
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
					dy = Math.fmod(y, 2);
				
				if(!(dy == 1 && i == this.hexesInRow)){ // не рисуем в четных рядах последний гекс для красивого отображения сетки
					// Флаг определяет будет ли на эом гексе препятствие
					var isObstruction = false;
					if(this.obstructionsHexes[x+"."+y]){
						console.log("isObstruction", isObstruction);
						isObstruction = true;
					}
				
					
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
			id: this.id,
			heroes: {},
			obstructionsHexes: this.obstructionsHexes
		};
		
		
		for (var i in this.heroes){
			battleInfo.heroes[String(this.heroes[i].userId)] = {
									id: String(this.heroes[i].userId),
									teamId: this.heroes[i].teamId,
									position: this.heroes[i].position,
									login: battleInfo.heroes[String(this.heroes[i].userId)]
								};
		}
		
		return battleInfo;
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
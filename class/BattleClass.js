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
		this.hexes = this.createGrid();
		this.heroes = {};
		
		
		// массив команда. одна команда это массив ид пользователей, нпц которые в этой команде
		this.teams = {'1': [], '2': []};
		
		
		
		
		console.log("battleId", this.id);
		console.log(this.hexes);
		
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
							f: "createBattle", 
							p: this.getBattleStatus()
						});
		
		
		
		
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
		for (var i = 1; i <= 10; i++){
			for (var j = 1; j <= 5; j++){
				var x = i - 1,
					y = j - 1;
					dy = Math.fmod(y, 2);
				
				if(!(dy == 1 && i == 10)){ // не рисуем в четных рядахпоследний гекс для красивого отображения сетки
					tmpArray[x+"."+y] = {};
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
			heroes: {}
		};
		
		
		for (var i in this.heroes){
			battleInfo.heroes[String(this.heroes[i].userId)] = {
									id: String(this.heroes[i].userId),
									teamId: this.heroes[i].teamId,
									position: this.heroes[i].position
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
		console.log(this.heroes);
		for(var i in this.heroes){
			console.log("i", i);
			this.heroes[i].socketWrite(data);
		}
	}
	
	
	
	
	
	this.create();
}



module.exports = BattleClass;
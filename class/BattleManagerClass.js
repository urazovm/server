console.log("BattleManagerClass CLASS is connected");	

function BMClass() {
	this.battles = {};
	this.deleteAllNotEndedBattles();
}


/*
	* Description:
	*	function Создает новую битву.
	*	
	*
	*
	* @since  31.01.15
	* @author pcemma
*/
BMClass.prototype.createBattle = function()
{
	var battle = new BattleClass({}),
		battleId = battle.id;
	if(battle){
		this.battles[battleId] = battle;
	}
	console.log("battleId", battleId);
	
	return battle.id
}


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
BMClass.prototype.removeBattle = function(data)
{
	if(data && data.id){
		delete this.battles[data.id];
	}
}


/*
	* Description:
	*	function вход в битву 
	*		@data: array
	*			@id: 	int, ид боя
	*			@user:	obj, объект пользователя
	*
	* @since  31.01.15
	* @author pcemma
*/
BMClass.prototype.enterBattle = function(data)
{
	if(
		data && data.id &&
		this.battles[data.id] && this.battles[data.id].check()
	){
		console.log("enterBattle 1");
		this.battles[data.id].addHero(data.user);
	}
	
	else if(lib.objectSize(this.battles) == 0){
		console.log("enterBattle 2");
		var battleId = this.createBattle();
		this.battles[battleId].addHero(data.user);
		
		
		//TODO: временно добавляем нпц в бой сразу за героем. Для тестов и показа издателю.
		// добавляем первого нпц тупо.
		this.battles[battleId].addHero(GLOBAL.NPCS.npc1);
		
	}
	
	else{
		// TODO: Временно для кнопки вступить в бой. Находим первый бой в который можно вступить
		console.log("enterBattle 3");
		for(var battleId in this.battles){
			if(this.battles[battleId] && this.battles[battleId].check()){
				this.battles[battleId].addHero(data.user);
				break;
			}
		}
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
BMClass.prototype.moveHero = function(data)
{
	console.log("\n BM moveHero");
	console.log(data);
	if(
		data && data.id &&
		this.battles[data.id] && this.battles[data.id].check()
	){
		console.log(data);
		this.battles[data.id].moveHero(data);
	}
}


/*
	* Description: герой совершает удар
	*	@data: arr
	*		@id: 		int, ид боя
	*		@hexId: 	str, вида x.y
	*
	*
	* @since  25.02.15
	* @author pcemma
*/
BMClass.prototype.heroMakeHit = function(data)
{
	console.log("\n BM heroMakeHit");
	console.log(data);
	if(
		data && data.id &&
		this.battles[data.id] && this.battles[data.id].check()
	){
		console.log(data);
		this.battles[data.id].heroMakeHit(data);
	}
}






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
BMClass.prototype.searchEnemyInArea = function(data)
{
	console.log("\n BM searchEnemyInArea");
	console.log(data);
	if(
		data && data.id &&
		this.battles[data.id] && this.battles[data.id].check()
	){
		console.log(data);
		return this.battles[data.id].searchEnemyInArea(data);
	}
	return false;
}



/*
	* Description: Очищает незакоченые бои в базе при старте сервера.
	*
	*
	* @since  08.03.15
	* @author pcemma
*/
BMClass.prototype.deleteAllNotEndedBattles = function()
{
	console.log("DELETE ALL OLD BATTLES!!");
	SQL.querySync("UPDATE `game_Battles` SET `game_Battles`.`endFlag` = 1");
}

	



module.exports = BMClass;
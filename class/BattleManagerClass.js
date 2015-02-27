console.log("BattleManagerClass CLASS is connected");	

function BMClass() {


	this.battles = {};

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
	}
	
	
	/*
		* Description:
		*	function вход в битву 
		*	
		*
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
			this.battles[data.id].addHero(data.user);
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
	//TODO: удалить создание боя с ид 1 для теста!
	this.createBattle();
}



module.exports = BMClass;
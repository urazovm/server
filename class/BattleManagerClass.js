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
	
	
	
	this.createBattle();
}



module.exports = BMClass;
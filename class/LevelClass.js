console.log("LevelClass CLASS is connected");	


function LevelClass(data) {
	this.__constructor(data);
};


/*
	* Description:
	*	function Class constructor
	*	
	*	@data: obj, {exp: value, level: value}
	*		
	*
	* @since  30.04.16
	* @author pcemma
*/
LevelClass.prototype.__constructor = function(data) {
	Object.keys(data).forEach(function(param) {
		this[param] = data[param];
	}.bind(this));
};


/*
	* Description:
	*	function Add exp
	*	
	*	@data: obj, 
	*		@exp: 	int, add exp value
	*		@compareLevel: 	obj, level from db (HeroLevels)
	*
	*
	* @since  01.05.16
	* @author pcemma
*/
LevelClass.prototype.updateExp = function(exp, compareLevel) {
	this.exp += exp;
	// TODO: проверка на последний уровнеь. скидывать на еще один круг
	while(this.exp >= compareLevel[this.level].maxExp){
		this.level++;
	}
};




module.exports = LevelClass;
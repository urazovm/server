console.log("LevelsManagerClass CLASS is connected");	

var GLOBAL = require("./PreloadDataClass.js"),
	LevelClass = require("./LevelClass.js"),
	compareLevels = {
		heroLevels: ["heroLevel"],
		professionLevels: [],
		possessionLevels: []
	};

function LevelsManagerClass(data) {
	this.__constructor(data);
};


/*
	* Description:
	*	function Class constructor
	*	
	*	@data: obj, { levelName: {exp: value, level: value}}
	*		
	*
	* @since  30.04.16
	* @author pcemma
*/
LevelsManagerClass.prototype.__constructor = function(data) {
	Object.keys(data).forEach(function(levelName) {
		this[levelName] = new LevelClass(data[levelName]);
	}.bind(this));
};


/*
	* Description:
	*	function Add exp
	*	
	*	@exp: int, experience value
	*	@levelName: str, the name of the level which need to update
	*
	*
	* @since  01.05.16
	* @author pcemma
*/
LevelsManagerClass.prototype.updateExp = function(exp, levelName) {
	var compareLevel = this.getCompareLevelArray(levelName);
	if(this.hasOwnProperty(levelName)){
		this[levelName].updateExp(exp, compareLevel);
	}
};


/*
	* Description:
	*	function Get the compare array for current level
	*	
	*	@levelName: str, the name of the level which need to update
	*
	*
	* @since  19.09.15
	* @author pcemma
*/
LevelsManagerClass.prototype.getCompareLevelArray = function(levelName) {
	for(var arrName in compareLevels) {
		if(compareLevels[arrName].indexOf(levelName) !== -1) {
			return GLOBAL.DATA[arrName];
		}
	}
};



module.exports = LevelsManagerClass;
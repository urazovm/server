console.log("GridClass CLASS is connected");

var GLOBAL = require("./PreloadDataClass.js"),
	HexagonClass = require("./HexagonClass.js");

function GridClass(data) {
	this.__constructor(data);
}


/*
	* Description:
	*	function Конструктор класса.
	*	
	*	@data: obj,
	*		@battleType: str, type of battle
	*
	*
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.__constructor = function(data) {
	this.hexesInRow = 8;
	this.hexesInCol = 7;
	this.battleType = data.battleType;
	this.obstructionsHexes = this.createobstructionsHexes();
	this.hexes = this.fill();
};	


/*
	* Description:
	*	function создает массив непроходимых гексов с препятствиями
	*	
	*
	*
	* @since  14.02.15
	* @author pcemma
*/
GridClass.prototype.createobstructionsHexes = function() {
	var tmpArray = {},
		obstructionsCount = Math.floor(Math.random() * 3) + 1;
	//TODO: sometimes obstructions are on the same hex
	for (var i= 1; i <= obstructionsCount; i++ ) {
		var x = Math.floor(Math.random() * (this.hexesInRow)),
			y = Math.floor(Math.random() * (this.hexesInCol)),
			randElem = Math.floor(Math.random() * GLOBAL.DATA.battleInfo[this.battleType].obstructions.length);
		tmpArray[x+"."+y] = GLOBAL.DATA.battleInfo[this.battleType].obstructions[randElem];
	}
	return tmpArray;
};


/*
	* Description:
	*	function Заполняет сетку гексами
	*	
	*
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.fill = function() {
	var tmpArray = {};
	for (var i = 1; i <= this.hexesInRow; i++) {
		for (var j = 1; j <= this.hexesInCol; j++) {
			var x = i - 1,
				y = j - 1;
				dy = Math.fmod(y, 2),
				isObstruction = this.obstructionsHexes.hasOwnProperty(x+"."+y); // Флаг определяет будет ли на этом гексе препятствие
			
			if(!(dy === 1 && i === this.hexesInRow)) { // не рисуем в четных рядах последний гекс для красивого отображения сетки
				
				var newHex = new HexagonClass({x: x, y: y, isObstruction: isObstruction});
				tmpArray[newHex.getId()] = newHex;
			}
		}
	}
	return tmpArray;
};


/*
	* Description:
	*	function Поиск свободных ячеек в области.
	*	
	*	@data: array
	*		@hexId: str, ид гекса центра области. Гекса в котором находится герой.
	*
	* @since  01.06.15
	* @author pcemma
*/
GridClass.prototype.searchFreeHexesInArea = function(data) {
	var hexId = data.hexId,
		radius = data.radius || 1,
		hexesArray = [];
	if(this.isHexExist(hexId)) {
		var area = this.hexes[hexId].getHexArea(radius);
		for(var i in area) {
			var hexIdInArea = area[i];
			if(
				this.isHexExist(hexIdInArea) &&
				this.isHexFree(hexIdInArea)
			) {
				hexesArray.push(hexIdInArea);
			}
		}
	}
	return hexesArray;
};


/*
	* Description:
	*	function Поиск врагов в области удара игрока.
	*	
	*	@data: array
	*		@hexId: 	str, ид гекса центра области. Гекса в котором находится герой.
	*  		@checkHero: func, функция проверки нахождения врага в гексе
	*
	*
	* 
	* @since  16.05.15
	* @author pcemma
*/
GridClass.prototype.searchEnemyInArea = function(data) {
	var hexId = data.hexId,
		radius = data.radius || 1,
		teamId = data.teamId,
		hexesArray = [];
	if(this.isHexExist(hexId)) {
		var area = this.hexes[hexId].getHexArea(radius);
		for(var i in area) {
			var hexIdInArea = area[i];
			if(
				this.isHexExist(hexIdInArea) &&
				this.getUserIdInHex(hexIdInArea) &&
				data.checkHero(this.getUserIdInHex(hexIdInArea), teamId)
			) {
				hexesArray.push(hexIdInArea);
			}
		}
	}
	return hexesArray;
};


/*
	* Description:
	*	function Обновляет инфо гекса о том что туда помещен герой.
	*	
	*	@data: array
	*		@hexId: 	str, ид гекса.
	*		@userId: 	str, ид героя.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.addHeroToHex = function(data, callback) {
	this.hexes[data.hexId].addHero({userId: data.userId});
	callback();
};


/*
	* Description:
	*	function Обновляет инфо гекса о том что герой перемещен из гекса.
	*	
	*	@hexId: 	str, ид гекса.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.removeHeroFromHex = function(hexId, callback) {
	this.hexes[hexId].removeHero();
	callback();
};


/*
	* Description:
	*	function Возвращает ид героя в гексе.
	*	
	*	@hexId: 	str, ид гекса.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.getUserIdInHex = function(hexId) {
	return this.hexes[hexId].getUserId();
};


/*
	* Description:
	*	function Проверяет существует ли гекс.
	*	
	*	@hexId: 	str, ид гекса.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.isHexExist = function(hexId) {
	return 	this.hexes.hasOwnProperty(hexId);
};


/*
	* Description:
	*	function Проверяет пустой ли гекс.
	*	
	*	@hexId: 	str, ид гекса.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.isHexFree = function(hexId) {
	return this.hexes[hexId].isFree();
};


/*
	* Description:
	*	function Находится ли гекс с ид hexId в области передвижения/удара вокруг гекса currentHexId.
	*	
	*	@data:
	*		@hexId: 		str, ид гекса.
	*		@currentHexId: 	str, ид гекса в обалсти которого ведутся поиски.
	*		@radius: 		int, area radius
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.isInArea = function(data) {
	return this.hexes[data.currentHexId].isInArea(this.hexes[data.hexId].getCoordinats(), data.radius);
};


/*
	* Description:
	*	function Проверяет возможно ли герою перейти в гекс.
	*	
	*	
	*	@data:
	*		@hexId: 		str, ид гекса.
	*		@currentHexId: 	str, ид гекса на котором сейчас находится герой.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.canHeroMoveToHex = function(data) {
	return 	(this.isHexExist(data.hexId) &&
			this.isHexFree(data.hexId) &&
			this.isInArea(data));	
};


/*
	* Description:
	*	function Проверяет возможно ли герою атаковать цель в гексе.
	*	
	*	
	*	@data:
	*		@hexId: 		str, ид гекса.
	*		@currentHexId: 	str, ид гекса на котором сейчас находится герой.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.canHeroAttackHex = function(data) {
	return 	(this.isHexExist(data.hexId) &&
			this.getUserIdInHex(data.hexId) &&
			this.isInArea(data));	
};



module.exports = GridClass;
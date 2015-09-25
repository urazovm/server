console.log("GridClass CLASS is connected");

function GridClass() {
	this.__constructor();
}


/*
	* Description:
	*	function Конструктор класса.
	*	
	*
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.__constructor = function() {
	this.hexesInRow = 8;
	this.hexesInCol = 7;
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
	var tmpArray = {};
	for (var i= 1; i <= Math.floor(Math.random() * (3 - 1 + 1)) + 1; i++ ) {
		var x = Math.floor(Math.random() * (this.hexesInRow + 1)),
			y = Math.floor(Math.random() * (this.hexesInCol + 1));
		tmpArray[x+"."+y] = String(Math.floor(Math.random() * (Object.keys(GLOBAL.DATA.battleInfo.obstructions).length - 1 + 1)) + 1);
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
				isObstruction = (this.obstructionsHexes[x+"."+y]) ? true : false; // Флаг определяет будет ли на эом гексе препятствие
			
			if(!(dy === 1 && i === this.hexesInRow)) { // не рисуем в четных рядах последний гекс для красивого отображения сетки
				var newHex = new HexagonClass({x: x, y: y, isObstruction: isObstruction})
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
		hexesArray = [];
	if(this.isHexExist(hexId)) {
		var area = this.hexes[hexId].getMoveArea();
		for(var hexesCount in area) {
			var hexIdInArea = area[hexesCount].getId();
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
		hexesArray = [];
	if(this.isHexExist(hexId)) {
		var area = this.hexes[hexId].getHitArea();
		for(var hexesCount in area) {
			
			var hexIdInArea = area[hexesCount].getId();
			//TODO: эти ифы тоже в отдельный метод.
			if(
				this.isHexExist(hexIdInArea) &&
				this.getUserIdInHex(hexIdInArea) &&
				data.checkHero(this.getUserIdInHex(hexIdInArea))
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
GridClass.prototype.addHeroToHex = function(data) {
	this.hexes[data.hexId].addHero({userId: data.userId});
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
GridClass.prototype.removeHeroFromHex = function(hexId) {
	this.hexes[hexId].removeHero();
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
	return 	hexId in this.hexes;
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
	*	@hexId: 		str, ид гекса.
	*	@currentHexId: 	str, ид гекса в обалсти которого ведутся поиски.
	*
	* @since  16.09.15
	* @author pcemma
*/
GridClass.prototype.isInArea = function(currentHexId, hexId) {
	return this.hexes[currentHexId].isInArea(this.hexes[hexId].getCoordinats());
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
	return 	this.isHexExist(data.hexId) &&
			this.isHexFree(data.hexId) &&
			this.isInArea(data.currentHexId, data.hexId);	
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
	return 	this.isHexExist(data.hexId) &&
			this.getUserIdInHex(data.hexId) &&
			this.isInArea(data.currentHexId, data.hexId);	
};



module.exports = GridClass;
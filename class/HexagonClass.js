console.log("HexagonClass CLASS is connected");	

function HexagonClass(data) {
	this.__constructor(data);
}


/*
	* Description:
	*	function создает гекс
	*	
	*
	*
	* @since  08.02.15
	* @author pcemma
*/
HexagonClass.prototype.__constructor = function(data) {
	this.isFree = true;
	this.userId = false;
	this.isObstructions = false;
	this.x = data.x;
	this.y = data.y;
	this.directions = [
		[ [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]],
		[ [1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]]
	];
	
	if(data.isObstruction) {
		this.makeObstraction();
	}
}


/*
	* Description:
	*	Делает гекс непроходимым с припятствиями
	*	
	*	
	*
	* @since  14.09.15
	* @author pcemma
*/
HexagonClass.prototype.makeObstraction = function() {
	this.isObstructions = true;
	this.isFree = false;
	// this.obstructionId = Math.floor(Math.random() * (lib.objectSize(GLOBAL.DATA.battleInfo.obstructions) - 1 + 1)) + 1;
}


/*
	* Description:
	*	function добавляет героя в гекс
	*	
	*
	* @since  08.02.15
	* @author pcemma
*/
HexagonClass.prototype.addHero = function(data) {
	this.isFree = false;
	this.userId = data.userId;
}


/*
	* Description:
	*	function удаляет героя из гекса
	*	
	*
	*
	* @since  08.02.15
	* @author pcemma
*/
HexagonClass.prototype.removeHero = function() {
	this.isFree = true;
	this.userId = false;
}


/*
	* Description:
	*	function проверяет является ли гекс с координатами, которые передали, соседом
	*	
	*	@data: array, {x, y}
	*
	*	return: bool, true/false
	*
	* @since  11.02.15
	* @author pcemma
*/
HexagonClass.prototype.isNeighbor = function(data) {
	var parity = this.y % 2;
		
	for(var i in this.directions[parity]) {
		if(
			data.x === this.x + this.directions[parity][i][0] && 
			data.y === this.y + this.directions[parity][i][1]
		) {
			return true;
		}
	}
	return false;
}


/*
	* Description:
	*	Ищет все гексы в обалсти удара.
	*	
	*
	*	return: array, массив гексов, которые находятся в области у текущего гекса
	*
	* @since  16.05.15
	* @author pcemma
*/
HexagonClass.prototype.getHitArea = function() {
	var parity = this.y % 2,
		hexesArray = [];
		
	for(var i in this.directions[parity]) {
		hexesArray.push({x: this.x + this.directions[parity][i][0], y: this.y + this.directions[parity][i][1]});
	}
	return hexesArray;
}



/*
	* Description:
	*	Ищет все гексы в обалсти хотьбы.
	*	
	*
	*	return: array, массив гексов, которые находятся в области у текущего гекса
	*
	* @since  01.06.15
	* @author pcemma
*/
HexagonClass.prototype.getMoveArea = function() {
	var parity = this.y % 2,
		hexesArray = [];
		
	for(var i in this.directions[parity]) {
		hexesArray.push({x: this.x + this.directions[parity][i][0], y: this.y + this.directions[parity][i][1]});
	}
	return hexesArray;
}


module.exports = HexagonClass;
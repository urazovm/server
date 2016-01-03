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
	this.isFreeFlag = true;
	this.userId = false;
	this.isObstructions = false;
	this.x = data.x;
	this.y = data.y;
	this.cubeCoordinats = this.calcCubeCoordinats();
	console.log(this.cubeCoordinats);
	// this.directions = [
	// 	[ [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]],
	// 	[ [1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]]
	// ];
	
	if(data.isObstruction) {
		this.makeObstraction();
	}
};


/*
	* Description:
	*	function Calculation cube coordinats of the hex
	*	
	*
	*
	* @since  04.01.16
	* @author pcemma
*/
HexagonClass.prototype.calcCubeCoordinats = function() {
	// # convert odd-r offset to cube
	var x = this.x - (this.y - this.y & 1) / 2,
		z = this.y,
		y = -x - z;
	return {x: x, z: z, y: y};
};


/*
	* Description:
	*	function convert cube coordinats to offset
	*	
	* 	@x: int, x coordinat
	* 	@y: int, y coordinat
	* 	@z: int, z coordinat
	*
	* @since  04.01.16
	* @author pcemma
*/
HexagonClass.prototype.convertCubeToOffset = function(x, z, y) {
	// # convert cube to odd-r offset
	var col = x + (z - z & 1) / 2,
		row = z;
	return {x: col, y: row};
};


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
	this.isFreeFlag = false;
	// this.obstructionId = Math.floor(Math.random() * (lib.objectSize(GLOBAL.DATA.battleInfo.obstructions) - 1 + 1)) + 1;
};


/*
	* Description:
	*	function добавляет героя в гекс
	*	
	*
	* @since  08.02.15
	* @author pcemma
*/
HexagonClass.prototype.addHero = function(data) {
	this.isFreeFlag = false;
	this.userId = data.userId;
};


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
	this.isFreeFlag = true;
	this.userId = false;
};


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
};


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
};


/*
	* Description:
	*	Возвращает ид героя в гексе.
	*	
	*
	*
	* @since  01.06.15
	* @author pcemma
*/
HexagonClass.prototype.getUserId = function() {
	return this.userId;
};


/*
	* Description:
	*	Возвращает Координаты гекса на сетке.
	*	
	*
	*	return: obj, {x: x, y: y}
	*
	* @since  16.09.15
	* @author pcemma
*/
HexagonClass.prototype.getCoordinats = function() {
	return {x: this.x, y: this.y};
};


/*
	* Description:
	*	Возвращает ИД гекса на сетке.
	*	
	*
	*	return: str, x.y
	*
	* @since  16.09.15
	* @author pcemma
*/
HexagonClass.prototype.getId = function() {
	return this.x+"."+this.y;
};


/*
	* Description:
	*	function проверяет является ли гекс с координатами, которые передали, соседом
	*	
	*	@neededHex: array, {x, y}
	*	@radius: 	int, radus in hexes
	*
	*	return: bool, true/false
	*
	* @since  11.02.15
	* @author pcemma
*/
HexagonClass.prototype.isInArea = function(neededHex, radius) {
	var minX = this.cubeCoordinats.x - radius,
		maxX = this.cubeCoordinats.x + radius,
		minY = this.cubeCoordinats.y - radius, 
		maxY = this.cubeCoordinats.y + radius, 
		minZ = this.cubeCoordinats.z - radius,
		maxZ = this.cubeCoordinats.z + radius;

	for (var x = minX; x <= maxX; x++) {
		for (var y = minY; y <= maxY; y++) {
			for (var z = minZ; z <= maxZ; z++) {
				// TODO: Проверить формулу. убрать лишний 3-й цикл + проверку. http://www.redblobgames.com/grids/hexagons/#field-of-view
				if (x + y + z === 0) {
    				var hexCoordinats = this.convertCubeToOffset(x, z, y);
					if(
						neededHex.x === hexCoordinats.x && 
						neededHex.y === hexCoordinats.y
					) {
						return true;
					}
				}
			}
		}
	}
	return false;
};


/*
	* Description:
	*	function проверяет является ли гекс свободным
	*	
	*
	*	return: bool, true/false
	*
	* @since  16.09.15
	* @author pcemma
*/
HexagonClass.prototype.isFree = function() {
	return this.isFreeFlag;
};



module.exports = HexagonClass;
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
	
	//TODO: это переделать. такого не должно быть!
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
	var x = this.x - (this.y - (this.y & 1)) / 2,
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
	var col = x + (z - (z & 1)) / 2,
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
	*	Ищет все гексы в обалсти хотьбы.
	*	
	*
	*	return: array, массив гексов, которые находятся в области у текущего гекса
	*
	* @since  01.06.15
	* @author pcemma
*/
HexagonClass.prototype.getHexArea = function(radius) {
	var hexesArray = [],
		radius = radius || 1;
	for (var dx = -radius; dx <= radius; dx++){
		for (var dy = Math.max(-radius, -dx - radius); dy <= Math.min(radius, -dx + radius); dy++){
			var dz = -dx-dy
			var hexCoordinats = this.convertCubeToOffset(this.cubeCoordinats.x + dx, this.cubeCoordinats.z + dz, this.cubeCoordinats.y + dy);
			hexesArray.push(hexCoordinats.x+"."+hexCoordinats.y);
		}
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
	for (var dx = -radius; dx <= radius; dx++){
		for (var dy = Math.max(-radius, -dx - radius); dy <= Math.min(radius, -dx + radius); dy++){
			var dz = -dx-dy
			var hexCoordinats = this.convertCubeToOffset(this.cubeCoordinats.x + dx, this.cubeCoordinats.z + dz, this.cubeCoordinats.y + dy);
			if(
				neededHex.x === hexCoordinats.x && 
				neededHex.y === hexCoordinats.y
			) {
				return true;
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
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
HexagonClass.prototype.__constructor = function(data)
{
	this.isFree = true;
	this.userId = false;
	this.x = data.x;
	this.y = data.y;
	
	if(data.isObstruction){
		this.isObstructions = true;
		this.isFree = false;
		this.obstructionId = Math.floor(Math.random() * (lib.objectSize(GLOBAL.DATA.battleInfo.obstructions) - 1 + 1)) + 1;
	}
}


/*
	* Description:
	*	function добавляет героя в гекс
	*	
	*	@data:			arr
	*		@userId:	str, id of the user
	*
	* @since  08.02.15
	* @author pcemma
*/
HexagonClass.prototype.addHero = function(data)
{
	this.isFree = false;
	this.userId = String(data.userId);
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
HexagonClass.prototype.removeHero = function(data)
{
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
HexagonClass.prototype.isNeighbor = function(data)
{
	var directions = [
				[ [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]],
				[ [1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]]
			],
		parity = this.y % 2;
		
	for(var i in directions[parity]){
		if(
			data.x == this.x + directions[parity][i][0] && 
			data.y == this.y + directions[parity][i][1]
		){
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
HexagonClass.prototype.getHitArea = function()
{
	var directions = [
				[ [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]],
				[ [1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]]
			],
		parity = this.y % 2,
		hexesArray = [];
		
	for(var i in directions[parity]){
		hexesArray.push({x: this.x + directions[parity][i][0], y: this.y + directions[parity][i][1]});
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
HexagonClass.prototype.getMoveArea = function()
{
	var directions = [
				[ [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]],
				[ [1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]]
			],
		parity = this.y % 2,
		hexesArray = [];
		
	for(var i in directions[parity]){
		hexesArray.push({x: this.x + directions[parity][i][0], y: this.y + directions[parity][i][1]});
	}
	return hexesArray;
}


module.exports = HexagonClass;
console.log("StatsManagerClass CLASS is connected");	

function StatsManagerClass(data) {
	this.__constructor(data);
}


/*
	* Description:
	*	function Конструктор класса.
	*	
	*	@data: obj, {statName: value}
	*		
	*
	* @since  19.09.15
	* @author pcemma
*/
StatsManagerClass.prototype.__constructor = function(data) {
	Object.keys(data).forEach(function(element) {
		this[element] = data[element];
	}.bind(this));
}


/*
	* Description:
	*	function Обновляет данные по статам в объекте
	*	
	*	@data: obj, {statName: value}
	*
	*
	* @since  19.09.15
	* @author pcemma
*/
StatsManagerClass.prototype.update = function(data) {
	Object.keys(data).forEach(function(element) {
		this[element] += data[element];
	}.bind(this));
}


module.exports = StatsManagerClass;
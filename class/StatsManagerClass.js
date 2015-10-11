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
	Object.keys(data).forEach(function(stat) {
		this[stat] = data[stat];
	}.bind(this));
};


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
	var updatedStats = this.updateDepends({}, data);
	// console.log("updatedStats", updatedStats);
	Object.keys(updatedStats).forEach(function(stat) {
		this[stat] += updatedStats[stat];
	}.bind(this));
	return updatedStats;
};


/*
	* Description:
	*	function Обновляет Дополнительные данные статов
	*	
	*	@stats: obj, {statName: value}
	*	@dependedStats: obj, {statName: value}
	*
	*
	* @since  25.09.15
	* @author pcemma
*/
StatsManagerClass.prototype.updateDepends = function(stats, dependedStats) {
	Object.keys(dependedStats).forEach(function(stat) {
		if(!(stat in stats)) { stats[stat] = 0; }
		stats[stat] += dependedStats[stat];
		stats = this.updateDepends(stats, this.convert(dependedStats[stat], GLOBAL.DATA.stats[stat].dependStats));
	}.bind(this));
	return stats;
};


/*
	* Description:
	*	function Преобразует значения статов, учитывая коэфицент
	*	
	*	@koef: num, коэфицент преобразования
	*	@data: obj, {statName: value}
	*
	*
	* @since  24.09.15
	* @author pcemma
*/
StatsManagerClass.prototype.convert = function(koef, data) {
	var revertStats = {};
	//TODO: добавить округление
	Object.keys(data).forEach(function(stat) {
		revertStats[stat] = koef * data[stat];
	});
	return revertStats;
};


/*
	* Description:
	*	function Преобразует значения статов в отрицательные
	*	
	*	@data: obj, {statName: value}
	*
	*
	* @since  20.09.15
	* @author pcemma
*/
StatsManagerClass.prototype.revert = function() {
	return this.convert(-1, this);
};


module.exports = StatsManagerClass;
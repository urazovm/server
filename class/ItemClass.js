console.log("ItemClass CLASS is connected");	

var StatsManagerClass = require("./StatsManagerClass.js"),
		mongoose 					= require("mongoose");


function ItemClass(data) {
	this.__constructor(data);
}


/*
	* Description:
	*	function Конструктор класса.
	*	
	*	@data: obj, {key: value}
	*		
	*
	* @since  11.10.15
	* @author pcemma
*/
ItemClass.prototype.__constructor = function(data) {
	Object.keys(data).forEach(function(key) {
		this[key] = data[key];
	}.bind(this));
	this.stats = new StatsManagerClass(this.stats);
};


/*
	* Description:
	*	function Добавляет итем в слот инвентаря. Надевает вещь.
	*	
	*	@inventorySlotId: arr, array of the items slots ids [inventorySlotId]
	*	@callback: 				func, callback function
	*		
	*
	* @since  11.10.15
	* @author pcemma
*/
ItemClass.prototype.setToInventorySlot = function(inventorySlotId, callback) {
	this.inventorySlotId = inventorySlotId || [];
	mongoose.model("game_worldItems").setInventorySlot(this._id, this.inventorySlotId, function(err) {
		if(err) {
			console.trace(err);
		}
		callback();
	});
};


/*
	* Description:
	*	Возвращает статы отрицательные.
	*	
	*
	* @since  11.10.15
	* @author pcemma
*/
ItemClass.prototype.revertStats = function() {
	return this.stats.revert();
};



module.exports = ItemClass;
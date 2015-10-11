console.log("ItemClass CLASS is connected");	

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
	*	@inventorySlotsArray: 	arr, массив ид слотов в инвентаре в которые надета вещь [inventorySlotId]
	*	@callback: 				func, функция ответа
	*		
	*
	* @since  11.10.15
	* @author pcemma
*/
ItemClass.prototype.setToInventorySlot = function(inventorySlotsArray, callback) {
	var	inventorySlots = inventorySlotsArray || [];
	
	// Обновляем слот ид в массиве свойств вещи пользователя.
	this.inventorySlotId = inventorySlots;
	
	Mongo.update({
		collection: 'game_WorldItems', 
		searchData: {_id: Mongo.objectId(this._id)}, 
		insertData: {$set:{inventorySlotId: inventorySlots}},
		callback: function(rows) { callback(); }
	});
};






module.exports = ItemClass;
console.log("StuffItemsManagerClass CLASS is connected");	

var GLOBAL = require("./PreloadDataClass");

function StuffItemsManagerClass() {
	
};


/*
	* Description:
	*	function add item to stuff
	*	
	*	@item: obj, 
	*		@worldItemId: 		str, id of the item from the game_WorldItems,
	*		@itemId: 					str, id of the item,
	*		@inventorySlotId: str, id of the slot in inventory
	*	
	*		
	*
	* @since  03.06.16
	* @author pcemma
*/
StuffItemsManagerClass.prototype.addItem = function(item) {
	this[item.inventorySlotId] = item;
};


/*
	* Description:
	*	function remove item to stuff
	*	
	*	@inventorySlotId: str, id of the slot remove item from
	*	@worldItemId: 		str, id of the item from game_WorldItems
	*		
	*
	* @since  03.06.16
	* @author pcemma
*/
StuffItemsManagerClass.prototype.removeItem = function(inventorySlotId, worldItemId) {
	if(
			this.isInventorySlotFull(inventorySlotId) && // Check is slot free
			this.getWorldItemIdFromWearItem(inventorySlotId) === worldItemId // Check is the same item we want to wear off
		) {
			delete this[inventorySlotId];
		}
};


/*
	* Description:
	*	function get user item id from the stuff slot
	*	
	*	@inventorySlotId: str, id of the slot
	*		
	*
	* @since  03.06.16
	* @author pcemma
*/
StuffItemsManagerClass.prototype.getWorldItemIdFromWearItem = function(inventorySlotId) {
	return this[inventorySlotId].worldItemId;
};



/*
	* Description:
	*	function check if slot free
	*	
	*	@inventorySlotId: str, id of the slot
	*		
	*
	* @since  03.06.16
	* @author pcemma
*/
StuffItemsManagerClass.prototype.isInventorySlotFull = function(inventorySlotId) {
	return (inventorySlotId in this);
};


module.exports = StuffItemsManagerClass;
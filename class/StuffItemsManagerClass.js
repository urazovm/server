console.log("StuffItemsManagerClass CLASS is connected");	

var GLOBAL = require("./PreloadDataClass.js");

function StuffItemsManagerClass() {
	
};


/*
	* Description:
	*	function add item to stuff
	*	
	*	@item: obj, 
	*		@userItemId: 			str, id of the item from the game_WorldItems,
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
	*	@userItemId: 			str, id of the item from game_WorldItems
	*		
	*
	* @since  03.06.16
	* @author pcemma
*/
StuffItemsManagerClass.prototype.removeItem = function(inventorySlotId, userItemId) {
	if(
			this.isInventorySlotFree(inventorySlotId) && // Check is slot free
			this.getUserItemId(inventorySlotId) === userItemId // Check is the same item we want to wear off
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
StuffItemsManagerClass.prototype.getUserItemId = function(inventorySlotId) {
	return this[inventorySlotId].userItemId;
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
StuffItemsManagerClass.prototype.isInventorySlotFree = function(inventorySlotId) {
	return (inventorySlotId in this);
};


module.exports = StuffItemsManagerClass;
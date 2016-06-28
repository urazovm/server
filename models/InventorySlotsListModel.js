var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	inventorySlotsListSchema = new Schema({
    name: 		String,
    imageId: 	Number,
    order: 		Number
	});

autoIncrement.initialize(connection);

inventorySlotsListSchema.plugin(autoIncrement.plugin, {
	model: 'game_inventorySlotsList', 
	startAt: 1
});


/*
	* Description:
	*	Get all inventory slots from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  15.06.16
	* @author pcemma
*/
inventorySlotsListSchema.statics.getAll = function(callback) {
	var inventorySlotsObject = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			inventorySlotsObject[element._id] = {
				_id: element._id,
				name: element.name,
				imageId: String(element.imageId),
				order: String(element.order)
			};
		}.bind(this));
		callback(inventorySlotsObject);
	}.bind(this));
}


mongoose.model('game_inventorySlotsList', inventorySlotsListSchema);
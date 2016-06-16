var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name);
	itemsSchema = new Schema({
    name : String,
    imageId : Number,
    rarity : Number,
    countableFlag : Boolean,
    shotId: Number,
    categories : [String],
    stats : Schema.Types.Mixed,
    attachments : Schema.Types.Mixed,
    inventorySlots : Schema.Types.Mixed
});

autoIncrement.initialize(connection);

itemsSchema.plugin(autoIncrement.plugin, {
	model: 'game_items', 
	startAt: 1
});


/*
	* Description:
	*	Get all items from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  16.06.16
	* @author pcemma
*/
itemsSchema.statics.getAll = function(callback) {
	var itemsObject = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			//TODO: check delete!
			delete element['__v'];
			itemsObject[element._id] = element;
		}.bind(this));
		callback(itemsObject);
	}.bind(this));
}



mongoose.model('game_items', itemsSchema);
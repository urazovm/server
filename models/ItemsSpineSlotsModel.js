var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	itemsSpineSlotsSchema = new Schema({
    name: 		String
	});

autoIncrement.initialize(connection);

itemsSpineSlotsSchema.plugin(autoIncrement.plugin, {
	model: 'game_itemsSpineSlots', 
	startAt: 1
});


/*
	* Description:
	*	Get all items spine slots from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  15.06.16
	* @author pcemma
*/
itemsSpineSlotsSchema.statics.getAll = function(callback) {
	var spineSlotsObject = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			spineSlotsObject[element._id] = {
				_id: element._id,
				name: element.name
			};
		}.bind(this));
		callback(spineSlotsObject);
	}.bind(this));
}


mongoose.model('game_itemsSpineSlots', itemsSpineSlotsSchema);
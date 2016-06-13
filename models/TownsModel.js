var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name);
	townsSchema = new Schema({
    name: String,
    buildings: [{ type: Number, ref: 'game_townsBuildings' }]
});

autoIncrement.initialize(connection);

townsSchema.plugin(autoIncrement.plugin, {
	model: 'game_towns', 
	startAt: 1
});


/*
	* Description:
	*	Get all towns from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  14.06.16
	* @author pcemma
*/
townsSchema.statics.getAllTowns = function(callback) {
	var townsObject = {};
	this.find().populate('buildings').exec(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			
			townsObject[element._id] = {
				name: element.name,
				buildings: this.convertBuildingsData(element.buildings)
			};
		}.bind(this));
		callback(townsObject);
	}.bind(this));
}


/*
	* Description:
	*	Convert buildings array.
	*	
	*	@buildings: array, array of the buildings in town
	*	
	*	
	*	return: obj, converted object of the buildings array
	*	
	* @since  14.06.16
	* @author pcemma
*/
townsSchema.statics.convertBuildingsData = function(buildings) {
	var newBuildings = {};
	buildings.forEach(function (element, index, array) {
		element._id = String(element._id);
		element.townId = String(element.townId);
		newBuildings[element._id] = element;
	});
	return newBuildings;
}


mongoose.model('game_towns', townsSchema);
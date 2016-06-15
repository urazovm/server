var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name);
	statsSchema = new Schema({
    name : String,
    group : String,
    order : String,
    dependStats : {}
    // buildings: [{ type: Number, ref: 'game_townsBuildings' }]
});

autoIncrement.initialize(connection);

statsSchema.plugin(autoIncrement.plugin, {
	model: 'game_stats', 
	startAt: 1
});


/*
	* Description:
	*	Get all stats from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  15.06.16
	* @author pcemma
*/
statsSchema.statics.getAllStats = function(callback) {
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


mongoose.model('game_stats', statsSchema);
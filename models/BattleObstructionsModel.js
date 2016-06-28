var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	battleObstructionsSchema = new Schema({
    name : String,
    imageId : String
	});

autoIncrement.initialize(connection);

battleObstructionsSchema.plugin(autoIncrement.plugin, {
	model: 'game_battleObstructions', 
	startAt: 1
});


/*
	* Description:
	*	Get all obstructions from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  26.06.16
	* @author pcemma
*/
battleObstructionsSchema.statics.getAll = function(callback) {
	var battleObstructions = {};
	this.find(function (err, rows) {
		if(err){
			console.trace(err);
		} 
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			battleObstructions[element._id] = element;
		});
		callback(battleObstructions);
	});
}

mongoose.model('game_battleObstructions', battleObstructionsSchema);
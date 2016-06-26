var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	gcSchema = new Schema({
    name : String,
    value : Schema.Types.Mixed
});

autoIncrement.initialize(connection);

gcSchema.plugin(autoIncrement.plugin, {
	model: 'game_globalConstants', 
	startAt: 1
});


/*
	* Description:
	*	Get all global constatns from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  26.06.16
	* @author pcemma
*/
gcSchema.statics.getAll = function(callback) {
	var globalConstants = {};
	this.find(function (err, rows) {
		if(err){
			console.trace(err);
		} 
		rows.forEach(function (element, index, array) {
			if(element.name === "clientVersion") {
				element.value = element.value.split(".");
			}
			globalConstants[element.name] = element.value
		});
		callback(globalConstants);
	});
}

mongoose.model('game_globalConstants', gcSchema);
var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	heroClassesSchema = new Schema({
    name : String,
    stats : Schema.Types.Mixed
});

autoIncrement.initialize(connection);

heroClassesSchema.plugin(autoIncrement.plugin, {
	model: 'game_heroClasses', 
	startAt: 1
});


/*
	* Description:
	*	Get all hero classes from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  18.06.16
	* @author pcemma
*/
heroClassesSchema.statics.getAll = function(callback) {
	var heroClassesObject = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			heroClassesObject[element._id] = element;
		}.bind(this));
		callback(heroClassesObject);
	}.bind(this));
}



mongoose.model('game_heroClasses', heroClassesSchema);
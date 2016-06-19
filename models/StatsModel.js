var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	statsSchema = new Schema({
    name : String,
    group : String,
    order : String,
    dependStats : Schema.Types.Mixed
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
statsSchema.statics.getAll = function(callback) {
	var statsObject = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			statsObject[element.name] = {
				_id: element._id,
				name: element.name,
				order: element.order,
				group: element.group,
				dependStats: element.dependStats || {}
			};
		}.bind(this));
		callback(statsObject);
	}.bind(this));
}


mongoose.model('game_stats', statsSchema);
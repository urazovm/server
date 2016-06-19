var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	heroLevelsSchema = new Schema({
    maxExp : Number
});

autoIncrement.initialize(connection);

heroLevelsSchema.plugin(autoIncrement.plugin, {
	model: 'game_heroLevels', 
	startAt: 0
});


/*
	* Description:
	*	Get all hero levels from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  15.06.16
	* @author pcemma
*/
heroLevelsSchema.statics.getAll = function(callback) {
	var heroLevelsObject = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			heroLevelsObject[element._id] = {
				_id: element._id,
				maxExp: element.maxExp
			};
		}.bind(this));
		callback(heroLevelsObject);
	}.bind(this));
}


mongoose.model('game_heroLevels', heroLevelsSchema);
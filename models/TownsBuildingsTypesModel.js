var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name);
	townsBuildingsTypesSchema = new Schema({
    name : String
});

autoIncrement.initialize(connection);

townsBuildingsTypesSchema.plugin(autoIncrement.plugin, {
	model: 'game_townsBuildingsTypes', 
	startAt: 1
});


/*
	* Description:
	*	Get all towns buildings types from db
	*	
	*	@callback: func, call back function
	*	
	* @since  14.06.16
	* @author pcemma
*/
townsBuildingsTypesSchema.statics.getAllTownBuildingsTypes = function(callback) {
	var types = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			types[element._id] = {
				_id: element.id,
				name: element.name
			};
		});
		callback(types);
	});
}



mongoose.model('game_townsBuildingsTypes', townsBuildingsTypesSchema);
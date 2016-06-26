var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	infoBattlesSchema = new Schema({
		backGroundImageId: String,
		hexImageId: String,
    obstructions: [{ type: String, ref: 'game_battleObstructions' }]
	});

autoIncrement.initialize(connection);

infoBattlesSchema.plugin(autoIncrement.plugin, {
	model: 'game_infoBattles', 
	startAt: 1
});


/*
	* Description:
	*	Get all battle info from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  26.06.16
	* @author pcemma
*/
infoBattlesSchema.statics.getAll = function(callback) {
	var battleInfo = {};
	this.find(function (err, rows) {
		if(err){
			console.trace(err);
		} 
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			battleInfo[element._id] = element;
		});
		callback(battleInfo);
	});
}

mongoose.model('game_infoBattles', infoBattlesSchema);
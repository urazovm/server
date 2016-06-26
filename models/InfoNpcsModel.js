var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	infoNpcsSchema = new Schema({
    name : String,
    enName : String,
    ruName : String,
   	count : Number,
    shotId : String,
    items : Schema.Types.Mixed,
    stats : Schema.Types.Mixed,
    levels : Schema.Types.Mixed, 
	});

autoIncrement.initialize(connection);

infoNpcsSchema.plugin(autoIncrement.plugin, {
	model: 'game_infoNpcs', 
	startAt: 1
});


/*
	* Description:
	*	Get all npcs info from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  16.06.16
	* @author pcemma
*/
infoNpcsSchema.statics.getAll = function(callback) {
	var npcsInfo = {};
	this.find(function (err, rows) {
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			npcsInfo[element._id] = element;
		});
		callback(npcsInfo);
	});
}

mongoose.model('game_infoNpcs', infoNpcsSchema);
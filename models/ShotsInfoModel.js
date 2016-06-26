var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	shotsSchema = new Schema({
    imageId : String,
    speed : Number,
    w : Number,
    h : Number
});

autoIncrement.initialize(connection);

shotsSchema.plugin(autoIncrement.plugin, {
	model: 'game_shots', 
	startAt: 1
});


/*
	* Description:
	*	Get all shots from db
	*	
	*	@callback: func, call back function
	*	
	*	
	*	
	* @since  14.06.16
	* @author pcemma
*/
shotsSchema.statics.getAll = function(callback) {
	var shotsObject = {};
	this.find(function (err, rows) {
		if(err){
			console.trace(err);
		} 
		rows.forEach(function (element, index, array) {
			element._id = String(element._id);
			
			shotsObject[element._id] = {
				name: element.name,
				speed: element.speed,
				w: element.w,
				h: element.h
			};
		}.bind(this));
		callback(shotsObject);
	}.bind(this));
}

mongoose.model('game_shots', shotsSchema);
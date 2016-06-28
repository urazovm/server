var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config"),
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
	* @since  26.06.16
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
				imageId: element.imageId,
				speed: element.speed,
				w: element.w,
				h: element.h
			};
		});
		callback(shotsObject);
	});
}

mongoose.model('game_shots', shotsSchema);
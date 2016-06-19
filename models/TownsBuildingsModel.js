var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name),
	townsBuildingsSchema = new Schema({
    ruName : String,
    enName : String,
    townId : { type: Number, ref: 'game_towns' },
    typeId : Number,
    imageId : Number,
    koefX : Number,
    koefY : Number
});

autoIncrement.initialize(connection);

townsBuildingsSchema.plugin(autoIncrement.plugin, {
	model: 'game_townsBuildings', 
	startAt: 1
});

mongoose.model('game_townsBuildings', townsBuildingsSchema);
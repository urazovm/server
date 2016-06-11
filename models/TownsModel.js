var mongoose = require("mongoose"),
	autoIncrement = require('mongoose-auto-increment'),
	config = require("../config/personal_config.js"),
	Schema = mongoose.Schema,
	connection = mongoose.createConnection(config.dbConfig.name);
	townsSchema = new Schema({
    name: String,
    buildings: [{ type: Number, ref: 'game_townsBuildings' }]
});

autoIncrement.initialize(connection);

townsSchema.plugin(autoIncrement.plugin, {
	model: 'game_towns', 
	startAt: 1
});

mongoose.model('game_towns', townsSchema);
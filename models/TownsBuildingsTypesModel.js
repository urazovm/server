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

mongoose.model('game_townsBuildingsTypes', townsBuildingsTypesSchema);
var mongoose = require("mongoose"),
	Schema = mongoose.Schema;

var townsSchema = new Schema({
    id: String,
    ruName: String,
    enName: String
});


mongoose.model('game_towns', townsSchema);
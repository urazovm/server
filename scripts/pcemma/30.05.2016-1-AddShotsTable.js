var config = require("../../config/personal_config.js"),
	async = require('async'),
	Mongo = require("../../class/MongoDBClass.js");


function runScript() {
	var queues = [
		Mongo.connect.bind(Mongo),
		addTable
	];
	async.waterfall(
		queues,
		function(err) {
			console.log("Script is completed!");
		}
	)
}


function addTable(callback) {
	var insertData = [{
		imageId: "1",
		speed: 0.48
	}];

	Mongo.insert({
    collection: "game_ShotsInfo", 
    insertData: insertData, 
    callback: function(rows) {
    	console.log("game_ShotsInfo were added!");
    	callback();
    }
  });
}


runScript();
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
	var insertData = [];
	for(var i = 0; i <= 50; i++) {
		insertData.push({id: i, maxExp: (i * 50)});
	}

	Mongo.insert({
    collection: "game_Levels", 
    insertData: insertData, 
    callback: function(rows) {
    	console.log("Levels were added!");
    	callback();
    }
  });
}


runScript();
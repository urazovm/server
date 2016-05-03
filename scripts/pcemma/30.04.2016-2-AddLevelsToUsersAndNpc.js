var config = require("../../config/personal_config.js"),
	async = require('async'),
	Mongo = require("../../class/MongoDBClass.js");


function runScript() {
	var queues = [
		Mongo.connect.bind(Mongo),
		addLevelsToUsers,
		addLevelsToNpcs,
		addToNpcsInfo
	];
	async.waterfall(
		queues,
		function(err) {
			console.log("Script is completed!");
		}
	)
}


function addLevelsToUsers(callback) {
	console.log("update Users");
	var insertData = {
		$set: {
			"userData.levels.heroLevel": {exp: 0, level: 1}
		}
	};

	Mongo.update({
		collection: "game_Users", 
		searchData: {},
		insertData: insertData,
		options: {
			multi: true
		}, 
		callback: function(rows) {
			console.log("Users are updated");
			callback();
		}
	});
}


function addLevelsToNpcs(callback) {
	console.log("update Npcs");
	var insertData = {
		$set: {
			"userData.levels.heroLevel": {exp: 0, level: 3}
		}
	};

	Mongo.update({
		collection: "game_Npcs", 
		searchData: {},
		insertData: insertData,
		options: {
			multi: true
		}, 
		callback: function(rows) {
			console.log("Npcs are updated");
			callback();
		}
	});
}


function addToNpcsInfo(callback) {
	console.log("update Npcs");
	var insertData = {
		$set: {
			"levels.heroLevel": {exp: 0, level: 3}
		}
	};

	Mongo.update({
		collection: "game_NpcsInfo", 
		searchData: {},
		insertData: insertData,
		options: {
			multi: true
		}, 
		callback: function(rows) {
			console.log("Npcs Info are updated");
			callback();
		}
	});
}





runScript();
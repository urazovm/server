var config = require("../../config/personal_config.js"),
	async = require('async'),
	Mongo = require("../../class/MongoDBClass.js");


function runScript() {
	var queues = [
		Mongo.connect.bind(Mongo),
		cleanUsers,
		cleanNpcs,
		cleanNpcsInfo
	];
	async.waterfall(
		queues,
		function(err) {
			console.log("Script is completed!");
		}
	)
}


function cleanUsers(callback) {
	console.log("update Users");
	var insertData = {
		$unset: {
			"userData.stats.exp": 1,
			"userData.stats.currentExp": 1,
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


function cleanNpcs(callback) {
	console.log("update Npcs");
	var insertData = {
		$unset: {
			"userData.stats.exp": 1,
			"userData.stats.currentExp": 1,
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


function cleanNpcsInfo(callback) {
	console.log("update Npcs Info");
	var insertData = {
		$unset: {
			"stats.exp": 1,
			"stats.currentExp": 1,
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
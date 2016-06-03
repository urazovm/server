var config = require("../../config/personal_config.js"),
	async = require('async'),
	Mongo = require("../../class/MongoDBClass.js");


function runScript() {
	var queues = [
		Mongo.connect.bind(Mongo),
		addItem
	];
	async.waterfall(
		queues,
		function(err) {
			console.log("Script is completed!");
		}
	)
}


function addItem(callback) {
	var insertData = [{
		"name" : "frozenStuff",
    "imageId" : 8,
    "rarity" : 6,
    "countableFlag" : false,
    "categories" : [ 
        "1"
    ],
    "stats" : {
        "wisdom" : 500,
        "minDamage" : 5,
        "maxDamage" : 25
    },
    "attachments" : {
        "1" : 1
    },
    "inventorySlots" : {
        "9" : "9"
    },
    "shotId": "574c4c4eb18306b839c2e7cc"
	}];

	Mongo.insert({
    collection: "game_Items", 
    insertData: insertData, 
    callback: function(rows) {
    	console.log("Item was added to game_Items.");
    	callback();
    }
  });
}


runScript();
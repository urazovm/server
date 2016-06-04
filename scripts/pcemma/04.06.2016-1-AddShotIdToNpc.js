var config = require("../../config/personal_config.js"),
	async = require('async'),
	Mongo = require("../../class/MongoDBClass.js");


function runScript() {
	var queues = [
		Mongo.connect.bind(Mongo),
		updateNpcWithShotId,
    updateNpcInfoWithShotId
	];
	async.waterfall(
		queues,
		function(err) {
			console.log("Script is completed!");
		}
	)
}


function updateNpcWithShotId(callback) {
  var insertData = {
    $set: {
      "userData.shotId": '5751600034afbcb04cf4f14d'
    }
  };

  Mongo.update({
    collection: "game_Npcs", 
    searchDAta: {},
    insertData: insertData,
    options: {
      multi: true
    }, 
    callback: function(rows) {
      console.log("Added shot Id to current npcs");
      callback();
    }
  });
}



function updateNpcInfoWithShotId(callback) {
  var insertData = {
    $set: {
      "shotId": '5751600034afbcb04cf4f14d'
    }
  };

  Mongo.update({
    collection: "game_NpcsInfo", 
    searchDAta: {},
    insertData: insertData,
    options: {
      multi: true
    }, 
    callback: function(rows) {
      console.log("Added shot Id to npc Info");
      callback();
    }
  });
}



runScript();
var config = require("../../config/personal_config.js"),
    async = require('async'),
    Mongo = require("../../class/MongoDBClass.js");


function runScript() {
  var queues = [
    Mongo.connect.bind(Mongo),
    updateUsers,
    updateStats,
    updateHeroes
  ];
  async.waterfall(
    queues,
    function(err) {
      console.log("Script is completed!");
    }
  )
}


function updateUsers(callback) {
  var insertData = {
    $set: {
      "userData.stats.moveRadius": 1, 
      "userData.stats.attackRadius": 1
    }
  };

  Mongo.update({
    collection: "game_Users", 
    searchDAta: {},
    insertData: insertData,
    options: {
      multi: true
    }, 
    callback: function(rows) {
      console.log("Added to users stats");
      callback();
    }
  });
}



function updateStats(callback) {
  var insertData = [
    {
      "id": 28,
      "name": "moveRadius",
      "group": 0,
      "order": 0,
      "dependStats": {}
    }, 
    {
      "id": 29,
      "name": "attackRadius",
      "group": 0,
      "order": 0,
      "dependStats": {}
    }
  ];

  Mongo.insert({
    collection: "game_Stats", 
    searchDAta: {},
    insertData: insertData,
    options: {
    }, 
    callback: function(rows) {
      console.log("Added to stats");
      callback();
    }
  });
}


function updateHeroes(callback) {
  var insertData = {
    $set: {
      "stats.moveRadius": 1, 
      "stats.attackRadius": 1
    }
  };

  Mongo.update({
    collection: "game_HeroClasses", 
    searchDAta: {},
    insertData: insertData,
    options: {
      multi: true
    }, 
    callback: function(rows) {
      console.log("Added to hero classes stats");
      callback();
    }
  });
}


runScript();




// var config = require("../../config/personal_config.js"),
// 	lib =  require("../../lib/lib.js"),
// 	MongoDBClass = require("../../class/MongoDBClass.js"),
// 	async = require("async");
	

// var Mongo = new MongoDBClass(function(){
	
//     var insertData = {
//         $set: {
//             "userData.stats.moveRadius": 1, 
//             "userData.stats.attackRadius": 1
//         }
//     };

//     Mongo.update({
//         collection: "game_Users", 
//         searchDAta: {},
//         insertData: insertData,
//         options: {
//             multi: true
//         }, 
//         callback: function(rows) {
//             console.log("Added to users stats");
//         }
//     });


//     insertData = [
//         {
//             "id": 28,
//             "name": "moveRadius",
//             "group": 0,
//             "order": 0,
//             "dependStats": {}
//         }, 
//         {
//             "id": 29,
//             "name": "attackRadius",
//             "group": 0,
//             "order": 0,
//             "dependStats": {}
//         }
//     ];

//     Mongo.insert({
//         collection: "game_Stats", 
//         searchDAta: {},
//         insertData: insertData,
//         options: {
//         }, 
//         callback: function(rows) {
//             console.log("Added to stats");
//         }
//     });



//     insertData = {
//         $set: {
//             "stats.moveRadius": 1, 
//             "stats.attackRadius": 1
//         }
//     };

//     Mongo.update({
//         collection: "game_HeroClasses", 
//         searchDAta: {},
//         insertData: insertData,
//         options: {
//             multi: true
//         }, 
//         callback: function(rows) {
//             console.log("Added to hero classes stats");
//         }
//     });

// });
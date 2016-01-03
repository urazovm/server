
var config = require("../../config/personal_config.js"),
	lib =  require("../../lib/lib.js"),
	MongoDBClass = require("../../class/MongoDBClass.js"),
	async = require("async");
	

var Mongo = new MongoDBClass(function(){
	
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
        }
    });


    insertData = [
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
        }
    });



    insertData = {
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
        }
    });

});
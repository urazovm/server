
var config = require("../../config/personal_config.js"),
	lib =  require("../../lib/lib.js"),
	MongoDBClass = require("../../class/MongoDBClass.js"),
	async = require("async");
	
var insertData = {
    $set: {
        dependStats: {}
    }
};
	
	

var Mongo = new MongoDBClass(function(){
	Mongo.update({
        collection: "game_Stats", 
        searchDAta: {},
        insertData: insertData,
        options: {
            multi: true
        }, 
        callback: function(rows) {
            console.log("DONE!");
        }
    });
});
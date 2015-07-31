
var config = require("../../config/personal_config.js"),
	lib =  require("../../lib/lib.js"),
	MongoDBClass = require("../../class/MongoDBClass.js"),
	async = require("async");
	
	
	
var data = 	[
		{
			id: 1,
			name: 'rightHandItem'
		},
		{
			id: 2,
			name: 'leftHandItem'
		},
		{
			id: 3,
			name: 'rightFoot'
		},
		{
			id: 4,
			name: 'leftFoot'
		}
	],
	Mongo = new MongoDBClass(function(){
		Mongo.insert('game_ItemsSpineSlots', data, function (rows) {
			for(var i in rows){
				console.log(rows[i]);
			}
		});
	});
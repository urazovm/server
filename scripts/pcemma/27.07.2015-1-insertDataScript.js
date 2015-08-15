
var config = require("../../config/personal_config.js"),
	lib =  require("../../lib/lib.js"),
	MongoDBClass = require("../../class/MongoDBClass.js"),
	async = require("async");
	
var us = {
    "_id" : ObjectId("55bf7283e7b2ad646a37da32"),
    "items" : {
        "1" : {
            "id" : 1,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f668b",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : ""
        },
        "2" : {
            "id" : 2,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f668c",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : ""
        },
        "3" : {
            "id" : 3,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f668d",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : ""
        },
        "4" : {
            "id" : 4,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f668e",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : ""
        },
        "5" : {
            "id" : 5,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f668f",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : "9"
        },
        "6" : {
            "id" : 6,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f6690",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : ""
        },
        "7" : {
            "id" : 7,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f6691",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : ""
        },
        "8" : {
            "id" : 8,
            "userId" : 1,
            "itemId" : "55ba5662d95a08c8513f6692",
            "inWorldItemId" : 0,
            "count" : 1,
            "inventorySlotId" : "6"
        }
    },
    "stuff" : {
        "6" : {
            "userItemId" : "8",
            "itemId" : "55ba5662d95a08c8513f6692",
            "inventorySlotId" : "6"
        },
        "9" : {
            "userItemId" : "5",
            "itemId" : "55ba5662d95a08c8513f668f",
            "inventorySlotId" : "9"
        }
    },
    "stats" : {
        "strength" : 1,
        "agility" : 1,
        "intuition" : 1,
        "wisdom" : 1,
        "intellect" : 1,
        "stamina" : 1,
        "luck" : 1,
        "actionTime" : 1,
        "moveActionTime" : 2,
        "hitActionTime" : 2,
        "minDamage" : 1,
        "maxDamage" : 3,
        "hp" : 8,
        "currentHp" : 8
    },
    "login" : "guest1",
    "email" : "guest1@1438603449534bew.net",
    "password" : "dd02441486ce67e5da7a446162ddd9b2",
    "lastActionTime" : 0,
    "inBattleFlag" : false,
    "isAliveFlag" : true
};
	
	
var data = 	[];
for (var i = 1; i < 10; i++){
	us.password = String(i);
	data.push(us);
}
	var Mongo = new MongoDBClass(function(){
		Mongo.insert('game_Users', data, function (rows) {
			for(var i in rows){
				console.log(rows[i]);
			}
		});
	});
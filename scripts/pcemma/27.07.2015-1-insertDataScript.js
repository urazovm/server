
var config = require("../../config/personal_config.js"),
	lib =  require("../../lib/lib.js"),
	MongoDBClass = require("../../class/MongoDBClass.js"),
	async = require("async");
	
	
	
var data = 	[
		{
			id: 1,
			ruName: 'Ратуша',
			enName: 'Town Hall',
			townId: 1,
			typeId: 1,
			imageId: 1,
			koefX: 0.250,
			koefY: 0.6
		},
		{
			id: 2,
			ruName: 'Арена',
			enName: 'Arena',
			townId: 1,
			typeId: 2,
			imageId: 2,
			koefX: 0.5,
			koefY: 0.9
		},
		{
			id: 3,
			ruName: 'Здание Альянса',
			enName: 'Alliance House',
			townId: 1,
			typeId: 3,
			imageId: 3,
			koefX: 0.750,
			koefY: 0.6
		},
		{
			id: 4,
			ruName: 'Магазин',
			enName: 'Shop',
			townId: 1,
			typeId: 4,
			imageId: 4,
			koefX: 0.1,
			koefY: 0.75
		},
		{
			id: 5,
			ruName: 'Склад',
			enName: 'Warehouse',
			townId: 1,
			typeId: 5,
			imageId: 5,
			koefX: 0.4,
			koefY: 0.75
		},
		{
			id: 6,
			ruName: 'Кузница',
			enName: 'Smithy',
			townId: 1,
			typeId: 6,
			imageId: 6,
			koefX: 0.750,
			koefY: 0.9
		},
		{
			id: 7,
			ruName: 'Алхимическая Мастерская',
			enName: 'Alchemical Workshop',
			townId: 1,
			typeId: 7,
			imageId: 7,
			koefX: 0.8,
			koefY: 0.75
		},
		{
			id: 8,
			ruName: 'Башня Мага',
			enName: 'Mage Tower',
			townId: 1,
			typeId: 10,
			imageId: 8,
			koefX: 0.250,
			koefY: 0.9
		},
		{
			id: 9,
			ruName: 'Мастерская',
			enName: 'Workshop',
			townId: 1,
			typeId: 8,
			imageId: 9,
			koefX: 0.5,
			koefY: 0.6
		},
		{
			id: 10,
			ruName: 'Дом Охотника',
			enName: "Hunter's House",
			townId: 1,
			typeId: 9,
			imageId: 10,
			koefX: 0.6,
			koefY: 0.75
		}
	],
	Mongo = new MongoDBClass(function(){
		Mongo.insert('game_TownsBuildings', data, function (rows) {
			for(var i in rows){
				console.log(rows[i]);
			}
		});
	});


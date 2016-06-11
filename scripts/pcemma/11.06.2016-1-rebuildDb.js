require("../../models/TownsModel");
require("../../models/TownsBuildingsModel");
require("../../models/TownsBuildingsTypesModel");



var async = require("async"),
  mongoose = require("mongoose"),
  config = require("../../config/personal_config.js");


mongoose.connect(config.dbConfig.name);

runScript();


function runScript() {
  var queues = [
    // addTowns,
    // addTownsBuildings,
    // addTownsBuildingsTypes
  ];
  async.waterfall(
    queues,
    function(err) {
      console.log("Script is completed!");
    }
  )
}

function addTowns (callback) {
  mongoose.model('game_towns').create({ name: 'humanGrad'}, function (err, town) {
    console.log("Towns were added.");
    callback();
  });
}


function addTownsBuildings (callback) {
  var queues = [];

  var arr = [
    {
      "ruName" : "Ратуша",
      "enName" : "Town Hall",
      "townId" : 1,
      "typeId" : 1,
      "imageId" : 1,
      "koefX" : 0.25,
      "koefY" : 0.6
    },
    {
      "ruName" : "Арена",
      "enName" : "Arena",
      "townId" : 1,
      "typeId" : 2,
      "imageId" : 2,
      "koefX" : 0.5,
      "koefY" : 0.9
    },
    {
      "ruName" : "Здание Альянса",
      "enName" : "Alliance House",
      "townId" : 1,
      "typeId" : 3,
      "imageId" : 3,
      "koefX" : 0.7500000000000000,
      "koefY" : 0.6000000000000000
    },
    {
      "ruName" : "Магазин",
      "enName" : "Shop",
      "townId" : 1,
      "typeId" : 4,
      "imageId" : 4,
      "koefX" : 0.1000000000000000,
      "koefY" : 0.7500000000000000
    },
    {
      "ruName" : "Склад",
      "enName" : "Warehouse",
      "townId" : 1,
      "typeId" : 5,
      "imageId" : 5,
      "koefX" : 0.4000000000000000,
      "koefY" : 0.7500000000000000
    },
    {
      "ruName" : "Кузница",
      "enName" : "Smithy",
      "townId" : 1,
      "typeId" : 6,
      "imageId" : 6,
      "koefX" : 0.7500000000000000,
      "koefY" : 0.9000000000000000
    },
    {
      "ruName" : "Алхимическая Мастерская",
      "enName" : "Alchemical Workshop",
      "townId" : 1,
      "typeId" : 7,
      "imageId" : 7,
      "koefX" : 0.8000000000000000,
      "koefY" : 0.7500000000000000
    },
    {
      "ruName" : "Башня Мага",
      "enName" : "Mage Tower",
      "townId" : 1,
      "typeId" : 10,
      "imageId" : 8,
      "koefX" : 0.2500000000000000,
      "koefY" : 0.9000000000000000
    },
    {
      "ruName" : "Мастерская",
      "enName" : "Workshop",
      "townId" : 1,
      "typeId" : 8,
      "imageId" : 9,
      "koefX" : 0.5000000000000000,
      "koefY" : 0.6000000000000000
    },
    {
      "ruName" : "Дом Охотника",
      "enName" : "Hunter's House",
      "townId" : 1,
      "typeId" : 9,
      "imageId" : 10,
      "koefX" : 0.6000000000000000,
      "koefY" : 0.7500000000000000
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_townsBuildings').create(element, function (err, rows) {
      console.log(rows);
      cb();
    });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Towns buildings were added.");
      callback();
    }
  )
}


function addTownsBuildingsTypes (callback) {
  var queues = [];

  var arr = [
    {
      "name" : "townHall"
    },
    {
      "name" : "battleArena"
    },
    {
      "name" : "allianceHouse"
    },
    {
      "name" : "shop"
    },
    {
      "name" : "warehouse"
    },
    {
      "name" : "smithy"
    },
    {
      "name" : "alchemicalWorkshop"
    },
    {
      "name" : "workshop"
    },
    {
      "name" : "hunterHouse"
    },
    {
      "name" : "mageTower"
    }
  ];


  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_townsBuildingsTypes').create(element, function (err, rows) {
      console.log(rows);
      cb();
    });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Towns buildings types were added.");
      callback();
    }
  )
}

require("../../models/TownsModel");
require("../../models/TownsBuildingsModel");
require("../../models/TownsBuildingsTypesModel");

require("../../models/StatsModel");
require("../../models/HeroLevelsModel");
require("../../models/InventorySlotsListModel");
require("../../models/ItemsSpineSlotsModel");



var async = require("async"),
  mongoose = require("mongoose"),
  config = require("../../config/personal_config.js");


mongoose.connect(config.dbConfig.name);

runScript();


function runScript() {
  var queues = [
    // addTownsBuildings,
    // addTowns,
    // addTownsBuildingsTypes,
    
    // addStats,
    // addHeroLevels,
    // addInventorySlots,
    // addItemsSpineSlots,
  ];
  async.waterfall(
    queues,
    function(err) {
      console.log("Script is completed!");
    }
  )
}

function addTowns (callback) {
  mongoose.model('game_towns').create({ name: 'humanGrad', buildings: [1,2,3,4,5,6,7,8,9,10]}, function (err, town) {
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


function addStats (callback) {
  var queues = [];

  var arr = [
    {
      "name" : "strength",
      "group" : 0,
      "order" : 0,
      "dependStats" : {
        "minDamage": 1,
        "maxDamage": 1,
      }
    },
    {
      "name" : "agility",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "intuition",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "wisdom",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "intellect",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "stamina",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "luck",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "minDamage",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "maxDamage",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "dodge",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "antiDodge",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "criticalHit",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "antiCriticalHit",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "mana",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "minMagicDamage",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "maxMagicDamage",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "hp",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "capacity",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "chance",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "exp",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "currentHp",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "currentExp",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "currentMana",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "currentCapacity",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "moveActionTime",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "hitActionTime",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "actionTime",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "moveRadius",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    },
    {
      "name" : "attackRadius",
      "group" : 0,
      "order" : 0,
      "dependStats" : {}
    }
  ];


  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_stats').create(element, function (err, rows) {
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Stats types were added.");
      callback();
    }
  )
}



function addHeroLevels (callback) {
  var queues = [];
  var arr = [];

  for (i=0; i<=50; i++){
    arr.push({maxExp: i * 50});
  }
  
  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_heroLevels').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Hero levels were added.");
      callback();
    }
  )
}




function addInventorySlots (callback) {
  var queues = [];
  var arr = [
    {
      "name" : "Шлем",
      "imageId" : 1,
      "order" : 1
    },
    {
      "name" : "Броня",
      "imageId" : 2,
      "order" : 2
    },
    {
      "name" : "Наручи",
      "imageId" : 3,
      "order" : 6
    },
    {
      "name" : "Перчатки",
      "imageId" : 4,
      "order" : 7
    },
    {
      "name" : "Штаны",
      "imageId" : 5,
      "order" : 4
    },
    {
      "name" : "Сапоги",
      "imageId" : 6,
      "order" : 5
    },
    {
      "name" : "Кольцо 1",
      "imageId" : 7,
      "order" : 10
    },
    {
      "name" : "Амулет",
      "imageId" : 8,
      "order" : 9
    },
    {
      "name" : "Правое оружие",
      "imageId" : 9,
      "order" : 3
    },
    {
      "name" : "Левое оружие",
      "imageId" : 10,
      "order" : 8
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_inventorySlotsList').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Inventory slots were added.");
      callback();
    }
  )
}



function addItemsSpineSlots (callback) {
  var queues = [];
  var arr = [
    {
      "name" : "rightHandItem"
    },
    {
      "name" : "leftHandItem"
    },
    {
      "name" : "rightFoot"
    },
    {
      "name" : "leftFoot"
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_itemsSpineSlots').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Items Spine Slots were added.");
      callback();
    }
  )
}

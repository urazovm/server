require("../../models/TownsModel");
require("../../models/TownsBuildingsModel");
require("../../models/TownsBuildingsTypesModel");

require("../../models/StatsModel");
require("../../models/HeroLevelsModel");
require("../../models/InventorySlotsListModel");
require("../../models/ItemsSpineSlotsModel");

require("../../models/ItemsModel");


require("../../models/HeroClassesModel");


require("../../models/ShotsInfoModel");
require("../../models/GlobalConstantsModel");
require("../../models/BattleObstructionsModel");
require("../../models/InfoBattlesModel");
require("../../models/InfoNpcsModel");



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

    // addItems,

    // addHeroClasses,


    // addShotsInfo,
    // addGlobalConstatns,
    // addBattleObstructions,
    // addBattleInfo,
    addNpcsInfo

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


function addItems (callback) {
  var queues = [];
  var arr = [
    {
      "name" : "sword",
      "imageId" : "1",
      "rarity" : "1",
      "countableFlag" : false,
      "categories" : [ 
        "1"
      ],
      "stats" : {
        "minDamage" : 10,
        "maxDamage" : 30
      },
      "attachments" : {
        "1" : 1
      },
      "inventorySlots" : {
        "9" : "9"
      }
    },
    {
      "name" : "redSword",
      "imageId" : "2",
      "rarity" : "2",
      "countableFlag" : false,
      "categories" : [ 
        "2"
      ],
      "stats" : {
        "minDamage" : 25,
        "maxDamage" : 60
      },
      "attachments" : {
        "1" : 1
      },
      "inventorySlots" : {
        "9" : "9"
      }
    },
    {
      "name" : "coal",
      "imageId" : "50",
      "rarity" : "1",
      "countableFlag" : true,
      "categories" : [ 
        "3"
      ],
      "stats" : {},
      "attachments" : {},
      "inventorySlots" : {}
    },
    {
      "name" : "redBoots",
      "imageId" : "5",
      "rarity" : "4",
      "countableFlag" : false,
      "categories" : [ 
        "4"
      ],
      "stats" : {},
      "attachments" : {
        "3" : 2,
        "4" : 1
      },
      "inventorySlots" : {
        "6" : "6"
      }
    },
    {
      "name" : "oldSword",
      "imageId" : "3",
      "rarity" : "1",
      "countableFlag" : false,
      "categories" : [ 
        "1"
      ],
      "stats" : {
        "minDamage" : 100,
        "maxDamage" : 300
      },
      "attachments" : {
        "1" : 1
      },
      "inventorySlots" : {
        "9" : "9"
      }
    },
    {
      "name" : "epicWoodSword",
      "imageId" : "4",
      "rarity" : "4",
      "countableFlag" : false,
      "categories" : [ 
        "2"
      ],
      "stats" : {},
      "attachments" : {
        "1" : 1
      },
      "inventorySlots" : {
        "9" : "9",
        "10" : "10"
      }
    },
    {
      "name" : "magicSword",
      "imageId" : "6",
      "rarity" : "6",
      "countableFlag" : false,
      "categories" : [ 
        "2"
      ],
      "stats" : {},
      "attachments" : {
        "1" : 1
      },
      "inventorySlots" : {
        "9" : "9"
      }
    },
    {
      "name" : "blueBoots",
      "imageId" : "7",
      "rarity" : "2",
      "countableFlag" : false,
      "categories" : [ 
        "4"
      ],
      "stats" : {},
      "attachments" : {
        "3" : 2,
        "4" : 1
      },
      "inventorySlots" : {
        "6" : "6"
      }
    },
    {
      "name" : "frozenStuff",
      "imageId" : "8",
      "rarity" : "6",
      "countableFlag" : false,
      "shotId" : 1,
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
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_items').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Items were added.");
      callback();
    }
  )
}


function addHeroClasses (callback) {
  var queues = [];
  var arr = [
    {
      "name" : "warrior",
      "stats" : {
        "strength" : 1,
        "agility" : 1,
        "intuition" : 1,
        "wisdom" : 1,
        "intellect" : 1,
        "stamina" : 1,
        "luck" : 1,
        "minDamage" : 3,
        "maxDamage" : 5,
        "dodge" : 0,
        "antiDodge" : 0,
        "criticalHit" : 0,
        "antiCriticalHit" : 0,
        "mana" : 0,
        "currentMana" : 0,
        "minMagicDamage" : 0,
        "maxMagicDamage" : 0,
        "hp" : 100,
        "currentHp" : 100,
        "capacity" : 0,
        "currentCapacity" : 0,
        "chance" : 0,
        "moveActionTime" : 2,
        "hitActionTime" : 2,
        "actionTime" : 1,
        "moveRadius" : 1,
        "attackRadius" : 1
      }
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_heroClasses').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Hero classes were added.");
      callback();
    }
  )
}


function addShotsInfo (callback) {
  var queues = [];
  var arr = [
    {
      "imageId" : "1",
      "speed" : 2,
      "w" : 178,
      "h" : 112
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_shots').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Shots were added.");
      callback();
    }
  )
}


function addGlobalConstatns (callback) {
  var queues = [];
  var arr = [
    {
      "name" : "clientVersion",
      "value" : "0.0.1"
    },
    {
      "name" : "globalDataVersion",
      "value" : 1
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_globalConstants').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Global Constants were added.");
      callback();
    }
  )
}


function addBattleObstructions (callback) {
  var queues = [];
  var arr = [
    {
      "name" : "Stone",
      "imageId" : '1'
    },
    {
      "name" : "Barrel",
      "imageId" : '2'
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_battleObstructions').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Battle Obstructions were added.");
      callback();
    }
  )
}


function addBattleInfo (callback) {
  var queues = [];
  var arr = [
    {
      backGroundImageId: "1",
      hexImageId: "1",
      obstructions: [1, 2]
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_infoBattles').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Battle Infos were added.");
      callback();
    }
  )
}


function addNpcsInfo (callback) {
  var queues = [];
  var arr = [
    {
      "name" : "littleRedDragon",
      "enName" : "little Red Dragon",
      "ruName" : "Красный малый дракон",
      "count" : 10,
      "shotId" : "1",
      "items" : {},
      "stats" : {
        "strength" : 1,
        "agility" : 1,
        "intuition" : 1,
        "wisdom" : 1,
        "intellect" : 1,
        "stamina" : 1,
        "luck" : 1,
        "minDamage" : 10,
        "maxDamage" : 15,
        "dodge" : 0,
        "antiDodge" : 0,
        "criticalHit" : 0,
        "antiCriticalHit" : 0,
        "mana" : 0,
        "currentMana" : 0,
        "minMagicDamage" : 0,
        "maxMagicDamage" : 0,
        "hp" : 20,
        "currentHp" : 20,
        "capacity" : 0,
        "currentCapacity" : 0,
        "chance" : 0,
        "moveActionTime" : 2,
        "hitActionTime" : 2,
        "actionTime" : 1,
        "moveRadius" : 1,
        "attackRadius" : 2
      },
      "levels" : {
        "heroLevel" : {
          "exp" : 0,
          "level" : 3
        }
      }
    }
  ];

  arr.forEach(function (element, index, array) {
    queues.push(function (cb) {
      mongoose.model('game_infoNpcs').create(element, function (err, rows) {
        console.log(rows);
        cb();
      });
    });
  });

  async.waterfall(
    queues,
    function(err) {
      console.log("Npcs Infos were added.");
      callback();
    }
  )
}
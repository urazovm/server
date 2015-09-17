
var config = require("../../config/personal_config.js"),
	lib =  require("../../lib/lib.js"),
	MongoDBClass = require("../../class/MongoDBClass.js"),
	async = require("async");
	
var insertData = [
    {
        name: "warrior",
        stats: {
            strength:           1,
            agility:            1,
            intuition:          1,
            wisdom:             1,
            intellect:          1,
            stamina:            1,
            luck:               1,
            minDamage:          3,
            maxDamage:          5,
            dodge:              0,
            antiDodge:          0,
            criticalHit:        0,
            antiCriticalHit:    0,
            mana:               0,
            currentMana:        0,
            minMagicDamage:     0,
            maxMagicDamage:     0,
            hp:                 100,
            currentHp:          100,
            capacity:           0,
            currentCapacity:    0,
            chance:             0,
            exp:                0,
            currentExp:         0,
            moveActionTime:     2,
            hitActionTime:      2,
            actionTime:         1
        }
    }
];
	
	

var Mongo = new MongoDBClass(function(){
	Mongo.insert({
        collection: "game_HeroClasses", 
        insertData: insertData, 
        callback: function(rows) {
            console.log("DONE!");
        }
    });
});
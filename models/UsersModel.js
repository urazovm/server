var mongoose = require("mongoose"),
	Schema = mongoose.Schema;

var usersSchema = new Schema({
    userData: {
    	stats:{
        "strength" : Number,
        "agility" : 1,
        "intuition" : 1,
        "wisdom" : 1,
        "intellect" : 1,
        "stamina" : 1,
        "luck" : 1,
        "minDamage" : 13,
        "maxDamage" : 35,
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
        "exp" : 0,
        "currentExp" : 0,
        "moveActionTime" : 2,
        "hitActionTime" : 2,
        "actionTime" : 1,
        "moveRadius" : 1,
        "attackRadius" : 1
      }
    }
});


mongoose.model('game_users', usersSchema);
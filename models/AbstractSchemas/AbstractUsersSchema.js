var mongoose    = require("mongoose"),
  config        = require("../../config/personal_config"),
  crypto        = require('crypto'),
  Schema        = mongoose.Schema,
  ObjectId      = mongoose.Types.ObjectId,
  connection    = mongoose.createConnection(config.dbConfig.name),
  abstractUsersSchema   = new Schema({
    registrationDate : String,
    userData : {
      lastActionTime : Number,
      inBattleFlag : Boolean,
      isAliveFlag : Boolean,
      items : Schema.Types.Mixed,
      stuff : Schema.Types.Mixed,
      levels : {
        heroLevel : {
          level : {type: Number, default: 1},
          exp : {type: Number, default: 0}
        }
      },
      stats : Schema.Types.Mixed
    }
  });


/*
  * Description:
  *   Get user data for client
  *   
  *   @_id: int, id of the user
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  24.06.16
  * @author pcemma
*/
abstractUsersSchema.statics.getUserData = function(_id, callback) {
  this.findById(ObjectId(_id), 'userData', function (err, userData) {
    console.log(userData.items);
    callback(err, userData.toObject());
  });
} 


/*
  * Description:
  *   Update user's stats
  *   
  *   @_id: int, id of the user
  *   @updatedStats: obj, list of the updated stats
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  24.06.16
  * @author pcemma
*/
abstractUsersSchema.statics.updateStats = function(_id, updatedStats, callback) {
  var insertData = {};
  Object.keys(updatedStats).forEach(function(stat) {
    insertData["userData.stats." + stat] = updatedStats[stat];
  });

  this.findByIdAndUpdate(ObjectId(_id), { $set: insertData}, [], function(err) {
    callback(err); 
  });
}


/*
  * Description:
  *   Update user's exp and level (hero level, prof level etc)
  *   
  *   @_id: int, id of the user
  *   @levelName: str, the name of the updated level
  *   @levelData: obj, the level info
  *     @exp: num, the current exp
  *     @level: num, the current level
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  24.06.16
  * @author pcemma
*/
abstractUsersSchema.statics.updateExp = function(_id, levelName, levelData, callback) {
  var insertData = {};
  insertData["userData.levels." + levelName] = levelData;
  this.findByIdAndUpdate(ObjectId(_id), { $set: insertData}, [], function(err) {
    callback(err); 
  });
}

module.exports = abstractUsersSchema;
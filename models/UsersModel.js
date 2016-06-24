var mongoose    = require("mongoose"),
  autoIncrement = require('mongoose-auto-increment'),
  config        = require("../config/personal_config.js"),
  crypto        = require('crypto'),
  Schema        = mongoose.Schema,
  connection    = mongoose.createConnection(config.dbConfig.name),
  usersSchema   = new Schema({
    email : String,
    password : String,
    registrationDate : String,
    userData : {
      login : String,
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
    },
    uid : String,
    langLocale : String,
    device : String,
    deviceSystemVersion : String,
    deviceToken : String,
    clientVersion : String,
    ip : String
  });

autoIncrement.initialize(connection);

usersSchema.plugin(autoIncrement.plugin, {
  model: 'game_users', 
  startAt: 1
});


/*
  * Description:
  *   Update client info 
  *   
  *   @_id: int, id of the user
  *   @data: obj, obj with user data
  *     @uid: str, 
  *     @langLocale: str, 
  *     @device: str, 
  *     @deviceSystemVersion: str, 
  *     @deviceToken: str, 
  *     @clientVersion: str, 
  *     @ip: str, 
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  18.06.16
  * @author pcemma
*/
usersSchema.statics.updateClientInfo = function(_id, data, callback) {
  var insertData = {
    uid: (data.uid) ? data.uid : "",
    langLocale: (data.langLocale) ? data.langLocale : "",
    device: (data.device) ? data.device : "",
    deviceSystemVersion: (data.deviceSystemVersion) ? data.deviceSystemVersion : "",
    deviceToken: (data.deviceToken) ? data.deviceToken : "",
    //TODO: Add new geoip Geoip now removed from lib
    // country: (data.ip) ? utils.getCountryByIp(data.ip) : "",
    clientVersion: (data.clientVersion) ? data.clientVersion : "",
    ip: (data.ip) ? data.ip : ""
  };
  this.findByIdAndUpdate(Number(_id), { $set: insertData}, [], function(err) {
    callback(err); 
  });
}  


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
usersSchema.statics.getUserData = function(_id, callback) {
  this.findById(Number(_id), 'userData', function (err, userData) {
    console.log(userData.items);
    callback(err, userData.toObject());
  });
} 


/*
  * Description:
  *   Check if user exist with these email and password
  *   
  *   @config: obj, 
  *     @email: str, user's email
  *     @password: str, user's password
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  24.06.16
  * @author pcemma
*/
usersSchema.statics.checkUserByEmailAndPassword = function(config, callback) {
  var searchData = {
    email: config.email.toLowerCase(),
    password: crypto.createHash('md5').update(String(config.password)).digest('hex')
  };
  this.findOne(searchData, {_id: true}, function(err, rows) {
    callback(err, rows);
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
usersSchema.statics.updateStats = function(_id, updatedStats, callback) {
  var insertData = {};
  Object.keys(updatedStats).forEach(function(stat) {
    insertData["userData.stats." + stat] = updatedStats[stat];
  });

  this.findByIdAndUpdate(Number(_id), { $set: insertData}, [], function(err) {
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
usersSchema.statics.updateExp = function(_id, levelName, levelData, callback) {
  var insertData = {};
  insertData["userData.levels." + levelName] = levelData;
  this.findByIdAndUpdate(Number(_id), { $set: insertData}, [], function(err) {
    callback(err); 
  });
}


mongoose.model('game_users', usersSchema);
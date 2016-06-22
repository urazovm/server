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
      levels : Schema.Types.Mixed,
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
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  18.06.16
  * @author pcemma
*/
usersSchema.statics.updateClientInfo = function(_id, insertData, callback) {
  this.findByIdAndUpdate(Number(_id), { $set: insertData}, [], function(err) {
    callback(); 
  });
}  


usersSchema.statics.getUserData = function(_id, callback) {
  this.findById(Number(_id), 'userData', function (err, userData) {
    callback(userData);
  });
} 


usersSchema.statics.checkUserByEmailAndPassword = function(config, callback) {
  var searchData = {
    email: config.email.toLowerCase(),
    password: crypto.createHash('md5').update(String(config.password)).digest('hex')
  };
  this.findOne(searchData, {_id: true}, function(err, rows) {
    callback(rows);
  });
}


usersSchema.statics.updateStats = function(_id, updatedStats, callback) {
  var insertData = {};
  Object.keys(updatedStats).forEach(function(stat) {
    insertData["userData.stats." + stat] = updatedStats[stat];
  });

  this.findByIdAndUpdate(Number(_id), { $set: insertData}, [], function(err) {
    callback(); 
  });
}






mongoose.model('game_users', usersSchema);
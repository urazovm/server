var mongoose = require("mongoose"),
  autoIncrement = require('mongoose-auto-increment'),
  config = require("../config/personal_config.js"),
  Schema = mongoose.Schema,
  connection = mongoose.createConnection(config.dbConfig.name);
  usersSchema = new Schema({
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
  *   Get all hero classes from db
  *   
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  18.06.16
  * @author pcemma
*/
usersSchema.statics.updateClientInfo = function(_id, insertData, callback) {
  console.log("SCHEMA updateClientInfo");
  console.log(typeof(callback), " !!!!!!! ");
  this.findByIdAndUpdate(Number(_id), { $set: insertData}, [], callback);
}  


usersSchema.statics.getUserData = function(_id, callback) {
  console.log("SCHEMA getUserData");
  this.findById(Number(_id), 'userData', function (err, userData) {
    console.log("SCHEMA getUserData response", userData);
    callback(userData);
  });
} 



mongoose.model('game_users', usersSchema);
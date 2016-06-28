var mongoose          = require("mongoose"),
  extend              = require('mongoose-schema-extend'),
  crypto              = require('crypto'),
  config              = require("../config/personal_config"),
  abstractUsersSchema = require('./AbstractSchemas/AbstractUsersSchema'),
  ObjectId            = mongoose.Types.ObjectId,
  connection          = mongoose.createConnection(config.dbConfig.name),
  usersSchema         = abstractUsersSchema.extend({
    email : String,
    password : String,
    userData : {
      login : String,
    },
    uid : String,
    langLocale : String,
    device : String,
    deviceSystemVersion : String,
    deviceToken : String,
    clientVersion : String,
    ip : String
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
  this.findByIdAndUpdate(ObjectId(_id), { $set: insertData}, [], function(err) {
    callback(err); 
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


mongoose.model('game_users', usersSchema);
var mongoose = require("mongoose"),
  autoIncrement = require('mongoose-auto-increment'),
  config = require("../config/personal_config"),
  Schema = mongoose.Schema,
  connection = mongoose.createConnection(config.dbConfig.name),
  battlesSchema = new Schema({
    startTime: String, 
    endFlag: Boolean,
    teams: {}
  });

autoIncrement.initialize(connection);

battlesSchema.plugin(autoIncrement.plugin, {
  model: 'game_battles', 
  startAt: 1
});


/*
  * Description:
  * End one battle
  *
  * @_id:         num, id of the battle 
  * @callback:  func, call back function
  * 
  * 
  * 
  * @since  27.06.16
  * @author pcemma
*/
battlesSchema.statics.endBattle = function(_id, callback) {
  this.findByIdAndUpdate(Number(_id), {$set: {endFlag: true}}, function(err) {
    callback(err); 
  });
}




/*
  * Description:
  * End all not ended battles
  *
  * @callback:  func, call back function
  * 
  * 
  * 
  * @since  27.06.16
  * @author pcemma
*/
battlesSchema.statics.endAllNotEndedBattles = function(callback) {
  this.update({}, {endFlag: true}, {multi: true}, function(err) {
    callback(err); 
  });
}

mongoose.model('game_battles', battlesSchema);

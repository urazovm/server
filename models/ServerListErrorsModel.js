var mongoose = require("mongoose"),
  config = require("../config/personal_config"),
  Schema = mongoose.Schema,
  ObjectId = mongoose.Types.ObjectId,
  connection = mongoose.createConnection(config.dbConfig.name),
  serverListErrorsSchema = new Schema({
    error: String,
    count: {type: Number, default: 0},
    state: {type: Number, default: 0}
  });

/*
  * Description:
  * Add error to errors list
  * 
  * @callback: func, call back function
  *  
  * 
  * @since  01.08.16
  * @author pcemma
*/
serverListErrorsSchema.statics.add = function(er, callback) {
  var conditions = {error: er.stack},
    update = {
      $set: {error: er.stack},
      $inc: {count: 1}
    }, 
    options = {
      upsert: true,
      new: true
    };
  this.findOneAndUpdate(conditions, update, options, function (err, er) {
    if(err){
      console.trace(err);
    } 
    callback(er);
  });
}

/*
  * Description:
  * Update state of the error
  * 
  * @er: obj, error object with ful information about error
  * 
  * @since  01.08.16
  * @author pcemma
*/
serverListErrorsSchema.statics.updateState = function(er) {
  //TODO: update only if undefined or > 0
  console.log(er);
  var insertData = {state: (er.state > 0) ? 2 : 0};
  this.findByIdAndUpdate(ObjectId(er._id), { $set: insertData}, [], function(err) {
    if(err){
      console.trace(err);
    } 
  });
}

mongoose.model('game_serverListErrors', serverListErrorsSchema);

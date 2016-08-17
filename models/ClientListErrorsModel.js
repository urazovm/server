var mongoose = require("mongoose"),
  config = require("../config/personal_config"),
  Schema = mongoose.Schema,
  ObjectId = mongoose.Types.ObjectId,
  connection = mongoose.createConnection(config.dbConfig.name),
  clientListErrorsSchema = new Schema({
    functionName: String,
    error: String,
    count: {type: Number, default: 0},
    state: {type: Number, default: 0},
    clientVersion: String
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
clientListErrorsSchema.statics.add = function(er, callback) {
  var conditions = {error: er.error},
    update = {
      $set: {error: er.error, functionName: er.functionName},
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
clientListErrorsSchema.statics.updateState = function(errorData, er) {
  var insertData = {};
  if(this.checkVersion(er.clientVersion, errorData.clientVersion)){
    console.log("need update!!!!!!!");
    insertData.clientVersion = er.clientVersion;
  }
  insertData.state = (errorData.state > 0) ? 2 : 0;
  this.findByIdAndUpdate(ObjectId(errorData._id), { $set: insertData}, [], function(err) {
    if(err){
      console.trace(err);
    } 
  });
}

/*
  * @Description:
  * Function that compare 2 strings of versions 
  * 
  * @newVersion: str, new client version 
  * @oldVersion: str, old clientversion for compare
  * 
  * @return: 
  *
  * @since  17.08.16
  * @author pcemma  
*/
clientListErrorsSchema.statics.checkVersion = function(newVersion, oldVersion) {
  if(oldVersion) {
    newVersion = newVersion.split(".");
    oldVersion = oldVersion.split(".");
    //TODO: rebuild this part
    for(var key in oldVersion) {
      if(Number(newVersion[key]) > Number(oldVersion[key])) {
        return true;
      }
      if(Number(newVersion[key]) < Number(oldVersion[key])) {
        return false;
      }
    }
    return false;
  }
  return true;
};


mongoose.model('game_clientListErrors', clientListErrorsSchema);

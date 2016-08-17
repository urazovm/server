var mongoose = require("mongoose"),
  config = require("../config/personal_config"),
  Schema = mongoose.Schema,
  connection = mongoose.createConnection(config.dbConfig.name),
  ObjectId = mongoose.Types.ObjectId,
  clientErrorsSchema = new Schema({
    errorId: { type: Schema.Types.ObjectId, ref: 'game_clientListErrors'},
    date: {type: Number, default: + new Date()},
    userId: {type: Schema.Types.ObjectId, ref: 'game_users'},
    clientVersion: {type: String}
  });

/*
  * Description:
  * Add error to client errors
  * 
  * @callback: func, call back function
  *  
  * 
  * @since  17.08.16
  * @author pcemma
*/
clientErrorsSchema.statics.add = function(er, callback) {
  var element = {
      errorId: er._id,
      clientVersion: er.clientVersion, 
      userId: ObjectId(er.userId)
    };
  this.create(element, function (err, rows) {
    if(err){
      console.trace(err);
    }
  });
}

mongoose.model('game_clientErrors', clientErrorsSchema);

var mongoose = require("mongoose"),
  config = require("../config/personal_config"),
  Schema = mongoose.Schema,
  connection = mongoose.createConnection(config.dbConfig.name),
  serverErrorsSchema = new Schema({
    errorId: { type: Schema.Types.ObjectId, ref: 'game_serverListErrors'},
    date: {type: Number, default: + new Date()}
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
serverErrorsSchema.statics.add = function(er, callback) {
  var element = {
      errorId: er._id
    };

  this.create(element, function (err, rows) {
    if(err){
      console.trace(err);
    }
  });
}

mongoose.model('game_serverErrors', serverErrorsSchema);

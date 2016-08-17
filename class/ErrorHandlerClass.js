console.log("ErrorHandlerClass CLASS is connected");  

// var Mongo = require("./MongoDBClass"),
var mongoose  = require("mongoose"),
  GLOBAL      = require("./PreloadDataClass");


function ErrorHandlerClass () {

}


/*
  * Description:
  * Листнер для домейна
  * 
  * @er: obj, error info
  *
  * @since  01.08.16
  * @author pcemma
*/
ErrorHandlerClass.prototype.logServerError = function(er) {
  console.log('### ERROR', er.stack);
  mongoose.model('game_serverListErrors').add(er, function (rows) {
    mongoose.model('game_serverListErrors').updateState(rows);
    mongoose.model('game_serverErrors').add(rows);
  });
}


/*
  * Description:
  * function that log clients error
  * 
  * @response:  response object
  * @er:  json, Data from client
  * 
  *
  * @since  26.07.15
  * @author pcemma
*/
ErrorHandlerClass.prototype.logClientError = function (er) {
  console.log("er.error_message",er);
  if(er.userId !== "") {
    mongoose.model('game_clientListErrors').add(er, function (rows) {
      mongoose.model('game_clientListErrors').updateState(rows, er);
      mongoose.model('game_clientErrors').add(rows);
    });
  }
}

module.exports = ErrorHandlerClass;
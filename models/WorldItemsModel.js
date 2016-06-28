var mongoose    = require("mongoose"),
  autoIncrement = require('mongoose-auto-increment'),
  config        = require("../config/personal_config"),
  Schema        = mongoose.Schema,
  ObjectId      = mongoose.Types.ObjectId,
  connection    = mongoose.createConnection(config.dbConfig.name),
  worldItemsSchema   = new Schema({
    stats : Schema.Types.Mixed,
    itemId : { type: Number, ref: 'game_items' },
    count : { type: Number, default: 1 },
    userId : { type: Schema.Types.ObjectId, ref: 'game_users' },
    inventorySlotId : { type: [String], default: [] }
  });

autoIncrement.initialize(connection);

worldItemsSchema.plugin(autoIncrement.plugin, {
  model: 'game_worldItems', 
  startAt: 1
});


/*
  * Description:
  *   Update client info 
  *   
  *   @item: obj, list of item's properties
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  24.06.16
  * @author pcemma
*/
worldItemsSchema.statics.createItem = function(item, callback) {
  this.create(item, function (err, rows) {
    callback(err);
  });
}


/*
  * Description:
  *   Update client info 
  *   
  *   @item: obj, list of item's properties
  *   @callback: func, call back function
  *   
  *   
  *   
  * @since  24.06.16
  * @author pcemma
*/
worldItemsSchema.statics.getUsersItems = function(userId, callback) {
  this.find({ userId: ObjectId(userId) }, function(err, items){
    callback(err, items);
  });
}  


/*
  * Description:
  *   Update world item. set it's slots ids
  *   
  *   @_id: int, id of item in game_worldItems
  *   @inventorySlotId: arr, list of items slots ids
  *   @callback: func, call back function
  *   
  * @since  25.06.16
  * @author pcemma
*/
worldItemsSchema.statics.setInventorySlot = function(_id, inventorySlotId, callback) {
  this.findByIdAndUpdate(Number(_id), { $set:{inventorySlotId: inventorySlotId} }, [], function(err) {
    callback(err); 
  });
}



mongoose.model('game_worldItems', worldItemsSchema);
console.log("MongoDBClass CLASS is connected");	
var MongoClient = require('mongodb').MongoClient;

function MongoDBClass(callback) {
	this.connect(callback);
	this.objectId = require('mongodb').ObjectID;
}


MongoDBClass.prototype.connect = function(callback){
	
	// Initialize connection once
	MongoClient.connect("mongodb://localhost/pcemmaDb", function(err, database) {
		if(err) throw err;
		this.db = database;
		console.log("MONGO START!");
		callback();
	}.bind(this));
}


/*
	* Description:
	* Поиск данных в коллекции
	* @data:
	*	@collection: 	str, Название коллекции
	*	@searchData: 	obj
	*	@fields: 		obj, 
	*	@callback:		func, 
	* @since  21.08.15
	* @author pcemma
*/
MongoDBClass.prototype.find = function(data) {
	var collection = this.db.collection(data.collection),
		searchData = data.searchData || {},
		fields = data.fields || {},
		callback = data.callback || function(){};
	collection.find(searchData, fields).toArray(function(err, docs) {
		callback(docs);
	});
}


MongoDBClass.prototype.insert = function(collection, insertData, callback) {
	// Get the documents collection
	var collection = this.db.collection(collection);
	// Insert some documents
	collection.insert(insertData, function(err, result) {
		// console.log(result);
		if(err) { console.log(err); }
		callback(result);
	});
}


/*
	* Description:
	* Обновление данных в коллекции
	* @data:
	*	@collection: 	str, Название коллекции
	*	@searchData: 	obj
	*	@insertData: 	obj, {$set : {a: 2}}
	*	@options:		obj
	*	@callback:		func, 
	* @since  21.08.15
	* @author pcemma
*/
MongoDBClass.prototype.update = function(data) {
	var collection = this.db.collection(data.collection),
		searchData = data.searchData || {},
		insertData = data.insertData || {},
		options = data.options || {},
		callback = data.callback || function(){};
	collection.update(searchData, insertData, options, function(err, result) {
		callback(result);
	});  
}


/*
	criteria is the query object to find the record
	sort indicates the order of the matches if there’s more than one matching record. The first record on the result set will be used. See Queries->find->options->sort for the format.
	update is the replacement object
	options define the behavior of the function
	callback is the function to run after the update is done. Has two parameters - error object (if error occured) and the record that was updated.
*/
MongoDBClass.prototype.findAndModify = function(collection, criteria, sort, update, options, callback) {
	this.db.collection(collection).findAndModify(criteria, sort, update, options, function(err, doc) {
		console.log(doc);
		callback(doc);
	}.bind(this));	
}


MongoDBClass.prototype.remove = function(collection, searchData, callback) {
	// Get the documents collection
	var collection = this.db.collection(collection);
	// Insert some documents
	collection.remove(searchData, function(err, result) {
		callback(result);
	});
}




module.exports = MongoDBClass;
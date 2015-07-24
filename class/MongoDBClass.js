console.log("MongoDBClass CLASS is connected");	
var MongoClient = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID,
	autoIncrement = require("mongodb-autoincrement");


function MongoDBClass(callback) {
	this.connect(callback);	
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


MongoDBClass.prototype.find = function(collection, searchData, callback) {
	// Get the documents collection
	var collection = this.db.collection(collection);
	// Find some documents
	collection.find({}).toArray(function(err, docs) {
		console.dir(docs);
		callback(docs);
	});
}



MongoDBClass.prototype.insert = function(collection, insertData, callback) {
	// Get the documents collection
	var collection = this.db.collection(collection);
	// Insert some documents
	collection.insert(insertData, function(err, result) {
		console.log(result);
		callback(result);
	});
}


MongoDBClass.prototype.insertLastId = function(collection, insertData, callback) {
	this.db.collection('counters').findAndModify({_id:collection}, {$inc : {seq:1}}, {new:true}, function(err, doc) {
		console.log('------------');
		console.log(doc);
		console.log('------------');
		// insertData.id = doc.seq;
		// this.insert(collection, insertData, callback);	
	}.bind(this));	
}





MongoDBClass.prototype.update = function(collection, searchData, insertData, callback) {
	// Get the documents collection
	var collection = this.db.collection(collection);
	// Update document where a is 2, set b equal to 1
	collection.update(searchData, { $set: insertData }, function(err, result) {
		callback(result);
	});  
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
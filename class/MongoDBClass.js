console.log("MongoDBClass CLASS is connected");	
var MongoClient = require('mongodb').MongoClient;

function MongoDBClass(callback) {
	this.connect(callback);
	this.objectId = require('mongodb').ObjectID;
}


MongoDBClass.prototype.connect = function(callback) {
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
	* Преобразовывает данные для запросов
	* @data:
	*	@collection: 	str, Название коллекции
	*	@searchData: 	obj
	*	@fields: 		obj, 
	*	@insertData: 	obj,
	*	@options: 		obj,
	*	@criteria: 		obj,
	*	@sort: 			arr,
	*	@update: 		obj,
	*   @callback:		func,          
	* 
	* @since  14.09.15
	* @author pcemma
*/
MongoDBClass.prototype.dataConversion = function(data) {
	var params = ["collection", "searchData", "fields", "insertData", "options", "criteria", "sort", "update",  "callback"];
	params.map(function(property) {
		if(property === "callback") {
			data[property] = data[property] || function() {};
		}
		if(property === "sort") {
			data[property] = data[property] || [];
		}
		data[property] = data[property] || {};
	});
	return data;
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
	data = this.dataConversion(data);
	var collection = this.db.collection(data.collection);
	collection.find(data.searchData, data.fields).toArray(function(err, docs) {
		data.callback(docs);
	});
}


/*
	* Description:
	* Добавление данных в коллекции
	* @data:
	*	@collection: 	str, Название коллекции
	*	@insertData: 	obj
	*	@callback:		func, 
	* @since  14.09.15
	* @author pcemma
*/
MongoDBClass.prototype.insert = function(data) {
	data = this.dataConversion(data);
	var collection = this.db.collection(data.collection);
	collection.insert(data.insertData, function(err, result) {
		if(err) { console.log(err); }
		data.callback(result);
	});
}


/*
	* Description:
	* Обновление данных в коллекции
	* @data:
	*	@collection: 	str, Название коллекции
	*	@searchData: 	obj,
	*	@insertData: 	obj, {$set : {a: 2}}
	*	@options:		obj,
	*	@callback:		func
	* @since  21.08.15
	* @author pcemma
*/
MongoDBClass.prototype.update = function(data) {
	data = this.dataConversion(data);
	var collection = this.db.collection(data.collection);
	collection.update(data.searchData, data.insertData, data.options, function(err, result) {
		data.callback(result);
	});  
}


/*
	* Description:
	* Обновление данных в коллекции мгновенно
	* @data:
	*	@collection: 	str, Название коллекции
	*	@criteria: 		obj,
	*	@sort: 			arr,
	*	@update: 		obj, {$set : {a: 2}}
	*	@options:		obj,
	*	@callback:		func
	* @since  14.08.15
	* @author pcemma
*/
MongoDBClass.prototype.findAndModify = function(data) {
	data = this.dataConversion(data);
	var collection = this.db.collection(data.collection);
	collection.findAndModify(data.criteria, data.sort, data.update, data.options, function(err, doc) {
		data.callback(doc);
	}.bind(this));	
}


/*
	* Description:
	* Удаление данных из коллекции
	* @data:
	*	@collection: 	str, Название коллекции
	*	@searchData:	obj,
	*	@callback:		func
	* @since  14.08.15
	* @author pcemma
*/
MongoDBClass.prototype.remove = function(data) {
	data = this.dataConversion(data);
	var collection = this.db.collection(data.collection);
	collection.remove(data.searchData, function(err, result) {
		data.callback(result);
	});
}




module.exports = MongoDBClass;
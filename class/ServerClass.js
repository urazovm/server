console.log("SERVER CLASS is connected");	
var net = require('net'),
	domain = require('domain'),
	async = require('async'),
	mongoose = require("mongoose"),


	// add personal config package
	config = require("./../config/personal_config"),

	Mongo = require("./MongoDBClass"),
	GLOBAL = require("./PreloadDataClass"),
	utils = require("./UtilsClass"),
	RouterClass = require("./RouterClass"),
	ErrorHandlerClass = require("./ErrorHandlerClass"),
	errorHandler = new ErrorHandlerClass(),
	router = new RouterClass();



function ServerClass() {
	this.start();
};


ServerClass.prototype.start = function() {
	
	mongoose.connect("mongodb://127.0.0.1/pcemmaDb");
	console.log("BEFORE", GLOBAL);
	var queues = [
		Mongo.connect.bind(Mongo),
		GLOBAL.initialize.bind(GLOBAL),
		this.startServer.bind(this)
	];

	async.waterfall(
		queues,
		function(err) {
			console.log("Server is started!");
		}
	);
};


/*
	* Description:
	*	Function стартуем socket server
	*		
	*
	*
	*	return:
	*
	* @since  31.03.14
	* @author pcemma
*/
ServerClass.prototype.startServer = function(callback) {
	var dServer = domain.create();
	dServer.on('error', function(err) { errorHandler.logServerError(err); });
	var android_server = net.createServer(this.onSocketRequest).listen(config.port_config.port_number_socket, '0.0.0.0');
	dServer.add(android_server);
	// var ios_server = net.createServer(onrequest).listen(config.port_config.port_number_ios, '0.0.0.0');
	
	console.log("\n\n -------------------------------------------------------------\n",
					"SERVER START TIME:"+Date()+" \n",
					"client version: ", GLOBAL.globalConstants.clientVersion+" \n", 
					"Data version: ", GLOBAL.globalConstants.globalDataVersion+" \n",
					"-------------------------------------------------------------\n\n");
	callback();
};


/*
	* Description:
	*	Function обработчик socket сервера
	*		
	*	@socket:	
	*
	*	return:
	*
	* @since  31.03.14
	* @author pcemma
*/
ServerClass.prototype.onSocketRequest = function(socket) {
	socket.setEncoding("utf8");
	var oData = "",
		dSocket = domain.create();
	
	// Вешаем обработчик ошибки,
	dSocket.on('error', function(err) { errorHandler.logServerError(err); });
	// Добавляем наши переменные, которые тоже могут сгенерировать ошибки самостоятельно
	dSocket.add(socket);
	
	//connect
	socket.on('connect', function () {
		// проверка на подключение пустого сокета. пустые сокеты которые открыли соединение но не прсилали команды авторизациинадо выкидывать
		socket.empty_connection = true;
		socket.timer_for_off_empty_socket = setTimeout(function() { utils.closeSocket(socket); }, 10000)

		console.log(" -------------------------------------------------------------\n",
					"Connection client, EMPTY SOCKET \n",
					"TIME:"+Date()+"\n",
					"-------------------------------------------------------------\n\n");			
	});
	
	
	//geting data
	socket.on("data", function(data) {
		oData += data;
		var testData = oData,
			testByte = Number(testData.slice(0,6)),
			testCommand = testData.slice(6,testData.lenght);
		
		// ВОЗМОЖНО ПРОВЕРКУ АНДО ПОМЕСТИТЬ В ВАЙЛ
		if ( Number( testCommand.length ) >= Number( testCommand.NumberByByte(testByte) ) ) {
			while(oData.length > 0) {
				var n = oData.slice(0,6);
				oData = oData.substring(6);
				var number_of_char = oData.NumberByByte(Number(n));
				n = oData.slice(0,number_of_char);
				oData = oData.substring(number_of_char);

				var data = JSON.parse(n);
				// console.log(data);
				
				// TODO: WTF??? o_O
				if(data.route === "authorization" || data.route === "getGlobalData" || data.route === "createNewAccount") {
					data.p.socket = socket;
				}
				router.route(data.route, data.p);
			}
		}
	});
		
		
	//closing connection 
	socket.on("close", function (had_error) {
		console.log(" -------------------------------------------------------------\n",
					"SOCKET CLOSE! \n",
					"TIME:"+Date()+"\n",
					"-------------------------------------------------------------\n\n");				
		// utils.close_user_socket(user_id, false, "close");
	});


	socket.on("end", function (had_error) {
		console.log(" -------------------------------------------------------------\n",
					"SOCKET END! \n",
					"TIME:"+Date()+"\n",
					"-------------------------------------------------------------\n\n");				
		// utils.close_user_socket(user_id, false, "end");			
	});

	
	//error!!!!!
	socket.on("error", function (err) {
		console.log(" -------------------------------------------------------------\n",
					"SOCKET ERROR! \n",
					err+"\n",
					"TIME:"+Date()+"\n",
					"-------------------------------------------------------------\n\n");			

		// utils.close_user_socket(user_id, true,"error");
	});	
};


module.exports = new ServerClass();
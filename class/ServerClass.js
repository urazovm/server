console.log("SERVER CLASS is connected");	
// var http = require("http");
var url = require("url");


function ServerClass() {
	var router = new RouterClass();
	// router.crontab();
	
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
	this.startSocket = function()
	{
		var android_server = net.createServer(this.onSocketRequest).listen(config.port_config.port_number_socket, '0.0.0.0');
		// var ios_server = net.createServer(onrequest).listen(config.port_config.port_number_ios, '0.0.0.0');
		console.log("SOCKET Server has started.");
	}
	
	
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
	this.onSocketRequest = function(socket){
		socket.setEncoding("utf8");

		var oData = "";
		
		// добавили сокет в домайн
		d.add(socket);
		
		//connect
		socket.on('connect', function () 
		{
			// проверка на подключение пустого сокета. пустые сокеты которые открыли соединение но не прсилали команды авторизациинадо выкидывать
			socket.empty_connection = true;
			socket.timer_for_off_empty_socket = setTimeout(function(){lib.close_socket(socket);}, 10000)

			console.log(" -------------------------------------------------------------\n",
						"Connection client, EMPTY SOCKET \n",
						"TIME:"+Date()+"\n",
						"-------------------------------------------------------------\n\n");			
		});
		
		
		//geting data
		socket.on("data", function(data) 
		{
			oData += data;
			
			var testData = oData;
			var testByte = Number(testData.slice(0,6));
			var testCommand = testData.slice(6,testData.lenght)

			// if ( testByte <= Number( testCommand.NumberByByte(testByte) ) ){
			
			// ВОЗМОЖНО ПРОВЕРКУ АНДО ПОМЕСТИТЬ В ВАЙЛ
			if ( Number( testCommand.length ) >= Number( testCommand.NumberByByte(testByte) ) ){
				while(oData.length > 0)
				{
					var n = oData.slice(0,6);
					oData = oData.substring(6);
					var number_of_char = oData.NumberByByte(Number(n));
					n = oData.slice(0,number_of_char);
					oData = oData.substring(number_of_char);

					var data = JSON.parse(n);
					// console.log(data);
					
					// Для авторизации надо передать сокет
					if(data.route == "authorization" || data.route == "getGlobalData"){
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
			// lib.close_user_socket(user_id, false, "close");
		});
	
	
		socket.on("end", function (had_error) {
			console.log(" -------------------------------------------------------------\n",
						"SOCKET END! \n",
						"TIME:"+Date()+"\n",
						"-------------------------------------------------------------\n\n");				
			// lib.close_user_socket(user_id, false, "end");			
		});

		
		//error!!!!!
		socket.on("error", function (err) {
			console.log(" -------------------------------------------------------------\n",
						"SOCKET ERROR! \n",
						err+"\n",
						"TIME:"+Date()+"\n",
						"-------------------------------------------------------------\n\n");			

			// lib.close_user_socket(user_id, true,"error");
		});
		
	}

}

module.exports = ServerClass;



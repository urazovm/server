console.log("SERVER CLASS is connected");	
var http = require("http");
var url = require("url");




function ServerClass() {
	var router = new RouterClass();
	// router.crontab();
	
	
	/*
		* Description:
		*	Function стартуем http server
		*	
		*
		*
		*	return:
		*
		* @since  31.03.14
		* @author pcemma
	*/
	this.startHttp = function()
	{
		// create server
		http.createServer(this.onHttpRequest).listen(config.port_config.port_number);
		console.log("HTTP Server has started.");
	}
	
	
	
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
		*	Function обработчик http сервера
		*		
		*	@request:
		*	@response:
		*
		*	return:
		*
		* @since  31.03.14
		* @author pcemma
	*/
	this.onHttpRequest = function(request, response){
		
		var postData = "";
		var pathname = url.parse(request.url).pathname;
		// console.log("Request for " + pathname + " received.");
		
		d.add(request);
		d.add(response);
		
		request.setEncoding("utf8");
		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
			// console.log("Received POST data chunk '"+ postDataChunk + "'.");
		});
		request.addListener("end", function() {
			router.route(pathname, response, postData);
		});
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
		
		d.add(socket);
		
		//connect
		socket.on('connect', function () 
		{
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
			if ( Number( testCommand.length ) >= Number( testCommand.NumberByByte(testByte) ) ){
				while(oData.length > 0)
				{
					var n = oData.slice(0,6);
					oData = oData.substring(6);
					var number_of_char = oData.NumberByByte(Number(n));
					n = oData.slice(0,number_of_char);
					oData = oData.substring(number_of_char);

					var data = n;
					var params = {};
			
					params = JSON.parse(data);
					if( GLOBAL.USERS[params.userId] && GLOBAL.USERS[params.userId].verifyHash == params.verifyHash )
					{
						
						// off flag if client send data for auth
						socket.empty_connection = false;
						clearTimeout(socket.timer_for_off_empty_socket);
						
						GLOBAL.USERS[params.userId].socket = socket;
						
						// lib.socket_write(GLOBAL.USERS[params.userId].socket, {});
						GLOBAL.USERS[params.userId].socketWrite({p: 0});
					}
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



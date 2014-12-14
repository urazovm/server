console.log("User CLASS is connected");	

function User() {

	this.userId = 0;
	
	// USER DATA
	this.data = {	
				};
				

	
	
	this.usersAreas = {};



	/*
		* Description:
		*	Отправляет по сокету данные клиенту 
		*	
		*	@params: array, array of params
		*			
		*
		* @since  22.04.14
		* @author pcemma
	*/
	User.prototype.socketWrite = function (params)
	{
		var string_params = JSON.stringify(params);
		var bytes_count = lib.return_bytes(string_params);
		if(this.socket)
			this.socket.write(bytes_count+string_params);
	}
		
	
	/*
		* Description:
		*	function check user 
		*	
		*	@params: array, array of params
		*			{
		*				auto_login	- str, login of user
		*			}
		*
		*	return: int/boolean, user_id if user exist, false if not!
		*
		* @since  14.12.14
		* @author pcemma, t
	*/
	User.prototype.check = function(params)
	{
		// TODO add check user code!
		var userId;
		
		if(params.auto_login){
		// old user. only return userId
			var req = SQL.querySync("SELECT `game_Users`.`id` FROM `game_Users` WHERE `game_Users`.`Login` = '"+params.auto_login+"'");
			var row = req.fetchAllSync();

			if(row[0])
				userId = row[0].id;

			this.login = params.auto_login;
		}else{
		// new user. need to create begin data to array and db!
			var currentTime = Math.floor(+new Date() / 1000);
			var query = "";
			
			// TODO: maybe in own function this code.
			userId = SQL.lastInsertIdSync("INSERT INTO `game_Users` (`id`, `login`) VALUES (NULL, '')");
			var login = "guest"+userId;
			this.login = login;
			// update Login
			SQL.querySync("UPDATE `game_Users` SET `login` = '"+login+"' WHERE `id` = "+userId);
			
			
			// UserData
			SQL.querySync("INSERT INTO `game_UsersData` (`id`, `userId`) VALUES (NULL, "+userId+") ");
			
			
			// UserCounters
			// query = ""
			// for(var i in GLOBAL.DATA.counters){
				// query += " (NULL,"+userId+","+GLOBAL.DATA.counters[i].id+",0),";
			// }
			// query = query.substring(0, query.length-1);
			// SQL.querySync("INSERT INTO `game_UsersCounters`(`id`, `userId`, `counterId`, `count`) VALUES "+query);			
			
			
			
		}
		return userId;
	}
	
		
	/*
		* Description:
		*	Get users info from UserData, User table
		*	
		*	
		*	return: 
		*
		* @since  11.02.14
		* @author pcemma
	*/
	User.prototype.getUserInfo = function()
	{
		// USER DATA 
		var req = SQL.querySync("	SELECT `ud`.* "+
								"	FROM  `game_UsersData`  `ud`"+
								"	WHERE `ud`.`userId` = "+this.userId);
								
								

		var rows = req.fetchAllSync();
		// for(var key in rows[0]){
			// this.data[key] = rows[0][key];
		// }
	}




	
	// AUTH //
	
	/*
		* Description:
		*	function auth user
		*	
		*	@params:	array, array of params
		*	@userId:	int, id of the user for auth
		*	
		*	return: 
		*
		* @since  10.02.14
		* @author pcemma
	*/
	User.prototype.auth = function(params)
	{
		
		
		this.userId = (params.userId && params.userId != 0) ? params.userId : this.userId;
		if(this.userId != 0){
		
			// USER COUNTERS
			// this.data.counters = EQM.getCounters(this.userId);
			
			// GET user's data
			this.getUserInfo();
			
			

			
			// GET BONUSES
			// this.data.bonuses = BM.getBonuses({userId: this.userId});
			// this.data.bonusesInProgress = BM.getBonusesInProgress({userId: this.userId});
			// this.data.tempBonuses = BM.getTempBonuses({userId: this.userId});
		
			
			
		
			console.log(this.data);
			// TODO: make function to create verify hash
			this.verifyHash = 1;
			
			this.ping = Math.floor(+new Date() / 1000);
		}
	}
	
	
	
	
	
}



module.exports = User;

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
		if(this.socket){
			var string_params = JSON.stringify(params);
			var bytes_count = lib.return_bytes(string_params);
			this.socket.write(bytes_count+string_params);
		}
	}
		
	
	/*
		* Description:
		*	function Проверяет есть ли пользователь с таким емайл и паролем в базе. если есть, возвращает ид этого пользователя
		*	
		*	@autoConfigData:
		*		@email:		str, email of the user
		*		@password:	str, password of the user
		*
		*
		*	return: int/boolean, user_id if user exist, false if not!
		*
		* @since  25.01.15
		* @author pcemma
	*/
	User.prototype.check = function(autoConfigData)
	{
		console.log(autoConfigData);
		var userId;
		if(
			autoConfigData && 
			autoConfigData.email && autoConfigData.email != "" &&
			autoConfigData.password && autoConfigData.password != ""
		){
			console.log("SELECT `game_Users`.`id` FROM `game_Users` WHERE `game_Users`.`email` = '"+SQL.mysqlRealEscapeString((autoConfigData.email.toLowerCase()))+"' AND `password` = '"+crypto.createHash('md5').update(String(autoConfigData.password)).digest('hex')+"' ");
			var req = SQL.querySync("SELECT `game_Users`.`id` FROM `game_Users` WHERE `game_Users`.`email` = '"+SQL.mysqlRealEscapeString((autoConfigData.email.toLowerCase()))+"' AND `password` = '"+crypto.createHash('md5').update(String(autoConfigData.password)).digest('hex')+"' ");
			
			var row = req.fetchAllSync();
			if(row[0])
				userId = row[0].id;
		}
		return userId;
	}
	
	
	/*
		* Description:
		*	function проверяет есть в базе пользователь с таким емайлом. Так же в функцию включена валидация емайла
		*	
		*	@autoConfigData:	array
		*		@email:			str, email of the user
		*	@takingIntoUser:	bool, флаг отвечает учитывать ли что емейл - это емейл того игрока, ктороый проверяет
		*
		*	return: flag:		boolean, да - если нашли такого юзера с таким же емайлом, нет - если не нашли
		*
		* @since  25.01.15
		* @author pcemma
	*/
	User.prototype.chekEmail = function(autoConfigData, takingIntoUser)
	{
		console.log("chekEmail");
		console.log(autoConfigData);
		var flag = false;
		if(
			autoConfigData && 
			autoConfigData.email && autoConfigData.email != "" &&
			lib.validateEmail(autoConfigData.email)
		){
			var req = SQL.querySync("SELECT `game_Users`.`id` FROM `game_Users` WHERE `game_Users`.`email` = '"+SQL.mysqlRealEscapeString((autoConfigData.email.toLowerCase()))+"' ");
			var row = req.fetchAllSync();
			if(row[0]){
				if(row[0].id == this.userId && takingIntoUser){
					flag = true;
				}
			}
			else{
				flag = true;
			}
		}
		return flag;
	}
	
	
	/*
		* Description:
		*	function Изменяет данные пользователя емайл и пароль, а так же тип пользователя в зависимости от дейсвтия.
		*	
		*	@autoConfigData:
		*		@email:		str, email of the user
		*		@password:	str, password of the user
		*
		*
		* @since  25.01.15
		* @author pcemma
	*/
	User.prototype.changeEmailAndPassword = function(autoConfigData)
	{
		console.log("changeEmailAndPassword");
		console.log(autoConfigData);
		if(
			autoConfigData && 
			autoConfigData.email && autoConfigData.email != "" &&
			lib.validateEmail(autoConfigData.email) &&
			autoConfigData.password && autoConfigData.password != ""
		){
			if(this.userType == 1)
				this.userType = 2;
			SQL.querySync("UPDATE `game_Users`SET `userType` = "+this.userType+", `email` = '"+SQL.mysqlRealEscapeString((autoConfigData.email.toLowerCase()))+"', `password` = '"+crypto.createHash('md5').update(String(autoConfigData.password)).digest('hex')+"' WHERE `game_Users`.`id` = "+this.userId);
		}
	}
	
	
	/*
		* Description:
		*	function Создаем нового пользователя. Заполняем все необходимые данные в базе данных. 
		*	
		*
		*	@params:				array
		*		@autoConfigData: 	array
		*			@email:			str, email of the user
		*			@password:		str, password of the user
		*		@uid:				
		*		@langLocale:		
		*		@device:		
		*		@deviceSystemVersion:		
		*		@deviceToken:		
		*		@clientVersion:		
		*	
		*
		*
		*
		*
		*
		*
		* @since  25.01.15
		* @author pcemma
	*/
	User.prototype.addNewUser = function(params)
	{
		// new user. need to create begin data to array and db!
		console.log(params);
		console.log()
		var userId 		= SQL.lastInsertIdSync("INSERT INTO `game_Users` (`id`) VALUES (NULL)"), 
			login		= "guest"+userId, 
			email 		= login+"@"+(+new Date())+"bew.net", 
			password 	= Math.random().toString(36).substr(2, 10), 
			userType 	= 1,
			currentTime = Math.floor(+new Date() / 1000),
			query 		= "";
		
		this.userId = userId;
		console.log("userId", this.userId);
		
		if(
			params.autoConfigData &&
			params.autoConfigData.email && params.autoConfigData.email != "" &&
			params.autoConfigData.password && params.autoConfigData.password != ""
		){
			email = params.autoConfigData.email.toLowerCase();
			password = params.autoConfigData.password;
			userType = 3;
		}
		
		// Обновляем данные для авторизации в базе
		SQL.querySync("UPDATE `game_Users` SET "+
								"`Login` = '"+login+"', "+
								"`email` = '"+SQL.mysqlRealEscapeString(email)+"', "+
								"`password` = '"+crypto.createHash('md5').update(String(password)).digest('hex')+"', "+
								"`userType` = "+userType+", "+
								"`registrationDate` = "+currentTime+", "+
								
								"`uid` = '"+SQL.mysqlRealEscapeString((params.uid) ? params.uid : "")+"', "+
								"`langLocale` = '"+SQL.mysqlRealEscapeString((params.langLocale) ? params.langLocale : "")+"', "+
								"`device` = '"+SQL.mysqlRealEscapeString((params.device) ? params.device : "")+"', "+
								"`deviceSystemVersion` = '"+SQL.mysqlRealEscapeString((params.deviceSystemVersion) ? params.deviceSystemVersion : "")+"', "+
								"`deviceToken` = '"+SQL.mysqlRealEscapeString((params.deviceToken) ? params.deviceToken : "")+"', "+
								
								"`ip` = '"+SQL.mysqlRealEscapeString((params.ip) ? params.ip : "")+"', "+
								"`country` = '"+SQL.mysqlRealEscapeString((params.ip) ? lib.getCountryByIp(params.ip) : "")+"', "+
								"`clientVersion` = '"+SQL.mysqlRealEscapeString((params.clientVersion) ? params.clientVersion : "")+"' "+
								
								"WHERE `id` = "+userId);
		
		
		
		
		// UserData
		// SQL.querySync("INSERT INTO `game_UsersData`(`id`, `user_id`, `last_resource_time_update`, `dailyAllianceEndTime`) VALUES (NULL, "+userId+", "+currentTime+", "+(currentTime + GLOBAL.globalConstants.dailyAllianceEndTime)+")");
		
		
		
		
		return {userId: userId, login: login, email: email, password: password};
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
		// Get verifyHash
		this.verifyHash = crypto.createHash('md5').update(String(+new Date()) + config.secretHashString + String(this.userId)).digest('hex');
		this.ping = Math.floor(+new Date() / 1000);
	}
	
	
	
	
	
}



module.exports = User;

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
		*	@data: array, array of params
		*			
		*
		* @since  22.04.14
		* @author pcemma
	*/
	User.prototype.socketWrite = function (data)
	{
		if(this.socket){
			var string_params = JSON.stringify(data);
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
		*	@data:				array
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
	User.prototype.addNewUser = function(data)
	{
		// new user. need to create begin data to array and db!
		console.log(data);
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
			data.autoConfigData &&
			data.autoConfigData.email && data.autoConfigData.email != "" &&
			data.autoConfigData.password && data.autoConfigData.password != ""
		){
			email = data.autoConfigData.email.toLowerCase();
			password = data.autoConfigData.password;
			userType = 3;
		}
		
		// Обновляем данные для авторизации в базе
		SQL.querySync("UPDATE `game_Users` SET "+
								"`Login` = '"+login+"', "+
								"`email` = '"+SQL.mysqlRealEscapeString(email)+"', "+
								"`password` = '"+crypto.createHash('md5').update(String(password)).digest('hex')+"', "+
								"`userType` = "+userType+", "+
								"`registrationDate` = "+currentTime+", "+
								
								"`uid` = '"+SQL.mysqlRealEscapeString((data.uid) ? data.uid : "")+"', "+
								"`langLocale` = '"+SQL.mysqlRealEscapeString((data.langLocale) ? data.langLocale : "")+"', "+
								"`device` = '"+SQL.mysqlRealEscapeString((data.device) ? data.device : "")+"', "+
								"`deviceSystemVersion` = '"+SQL.mysqlRealEscapeString((data.deviceSystemVersion) ? data.deviceSystemVersion : "")+"', "+
								"`deviceToken` = '"+SQL.mysqlRealEscapeString((data.deviceToken) ? data.deviceToken : "")+"', "+
								
								"`ip` = '"+SQL.mysqlRealEscapeString((data.ip) ? data.ip : "")+"', "+
								"`country` = '"+SQL.mysqlRealEscapeString((data.ip) ? lib.getCountryByIp(data.ip) : "")+"', "+
								"`clientVersion` = '"+SQL.mysqlRealEscapeString((data.clientVersion) ? data.clientVersion : "")+"' "+
								
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
		*	@data:	array, array of params
		*	@userId:	int, id of the user for auth
		*	
		*	return: 
		*
		* @since  10.02.14
		* @author pcemma
	*/
	User.prototype.auth = function(data)
	{
		
		this.userId = data.userId;
		
		// Get verifyHash
		this.verifyHash = crypto.createHash('md5').update(String(+new Date()) + config.secretHashString + String(this.userId)).digest('hex');
		this.ping = Math.floor(+new Date() / 1000);
		
		
		
		
		
		//TODO: перенести это в кеш!!! Тут должна сработаь функция взятия из кеша всех данных.
		
		
		
		
	}
	
	
	
	
	
}



module.exports = User;

console.log("User CLASS is connected");	

function User() {

	this.userId = 0;
	
	// USER DATA
	this.userData = {

					
				};
				




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
		var userId 		= SQL.lastInsertIdSync("INSERT INTO `game_Users` (`id`) VALUES (NULL)"), 
			login		= "guest"+userId, 
			email 		= login+"@"+(+new Date())+"bew.net", 
			password 	= Math.random().toString(36).substr(2, 10), 
			userType 	= 1,
			currentTime = Math.floor(+new Date() / 1000),
			query 		= "";
		
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
		
		// Добавляем статы игроку
		this.addStats(userId);
		
		return {userId: userId, login: login, email: email, password: password};
	}
	
	
	/*
		* Description:
		*	Добавляем статы новому игроку
		*	
		*	
		*	return: 
		*
		* @since  21.02.15
		* @author pcemma
	*/
	User.prototype.addStats = function(userId)
	{
		var tempArray = {
			strength:			1,
			agility:			1,
			intuition:			1,
			wisdom:				1,
			intellect:			1,
			stamina:			1,
			luck:				1,
			actionTime:			1,
			moveActionTime:		2000,
			hitActionTime:		2000
		},
		queryArray = [];
		
		for (var key in tempArray){
			queryArray.push("("+userId+", "+GLOBAL.DATA.stats[key].id+", "+tempArray[key]+")");
		}
		SQL.querySync("INSERT INTO `game_UsersStats` (`userId`, `statId`, `value`) VALUES "+queryArray.join(",")+" ");
		
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
		// Get verifyHash
		this.socket = data.socket;
		this.verifyHash = crypto.createHash('md5').update(String(+new Date()) + config.secretHashString + String(this.userId)).digest('hex');
		this.ping = Math.floor(+new Date() / 1000);
	}
	
	
	/*
		* Description:
		*	Собирает массив данных о пользователе. 
		*	@userId:	int, ид пользователя
		*	
		*	return: 
		*
		* @since  21.02.15
		* @author pcemma
	*/
	User.prototype.getUserData = function(userId)
	{
		//TODO: перенести это в кеш!!! Тут должна сработаь функция взятия из кеша всех данных.
		this.userId = userId;
		//TODO взятие данных типа логин и прочие
		this.userData.login = "guest"+this.userId;
		this.userData.lastActionTime = 0;
		
		
		//Флаги
		this.userData.inBattleFlag = false;
		this.userData.isAliveFlag = true;;
		
		// Собираем статы игрока те что в базе
		this.getStats();
		
		// пересчитываем статы игрока. с учетом всех данных
		this.recountStats();
	}
	
	
	/*
		* Description:
		*	Собирает статы игрока которые есть в базе
		*	
		*	return: 
		*
		* @since  21.02.15
		* @author pcemma
	*/
	User.prototype.getStats = function()
	{
		var req = SQL.querySync("SELECT `us`.*, `gs`.`name` "+
								"FROM `game_UsersStats` `us`, `game_Stats` `gs` "+
								"WHERE `us`.`userId` = "+this.userId+" AND `gs`.`id` = `us`.`statId`");
		var rows = req.fetchAllSync();
		
		for (var key in rows){
			this.userData[rows[key].name] = rows[key].value;
		}
	}
	
	
	/*
		* Description:
		*	Собирает статы игрока которые есть в базе
		*	
		*	return: 
		*
		* @since  21.02.15
		* @author pcemma
	*/
	User.prototype.recountStats = function()
	{
		
		// minDamage
		this.userData['minDamage'] = this.userData['strength'];
		// maxDamage
		this.userData['maxDamage'] = this.userData['strength'] * 3;
		// hp
		this.userData['hp'] = this.userData['stamina'] * 8;
		// currentHp
		this.userData['currentHp'] = this.userData['stamina'] * 8;
	}
	
	
	

	
	
	/*
		* Description: Функция считает удар, который герой может нанести
		*
		*
		* @since  02.03.15
		* @author pcemma
	*/
	User.prototype.countDamage = function()
	{
		var damage = Math.floor(Math.random() * (this.userData.maxDamage - this.userData.minDamage + 1)) + this.userData.minDamage;
		return damage;
	}
	
	
	/*
		* Description: Проверка мерт ли герой. 
		*
		*
		* @since  01.03.15
		* @author pcemma
	*/
	User.prototype.isAlive = function()
	{
		console.log("\n\n ------------");
		console.log("this.userData.currentHp", this.userData.currentHp);
		if(this.userData.currentHp <= 0 ){
			this.userData.currentHp = 0;
			this.userData.isAliveFlag = false;
		}
		
		console.log("this.userData.isAliveFlag", this.userData.isAliveFlag);
		console.log("------------ \n\n");
		return this.userData.isAliveFlag;
	}
	
}



module.exports = User;

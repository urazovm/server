console.log("Npc CLASS is connected");	

function Npc() {

	this.userId = 0;
	
	// USER DATA
	this.userData = {
						items: {}, 	// Предметы
						stuff: {} 	// Надетые вещи
					};
}				

Npc.prototype = Object.create(UserClass.prototype);
Npc.prototype.constructor = Npc;





/*
	* Description:
	*	Собирает массив данных о нпц. 
	*	@data:	array
	*		@npcId:		int, ид нпц из базы всех нпц.
	*		@userId:	int, ид нпц в массиве всех нпц в мире
	*	
	*	return: 
	*
	* @since  07.05.15
	* @author pcemma
*/
Npc.prototype.getUserData = function(data)
{
	
	// TODO: переписать этот метод в юзер классе. он должен быть один и для нпц и для юзера
	
	this.userId = data.userId; 	// Вид: "npc"+id, где ид - эт порядковый номер нпц в спике всех нпц
	this.npcId = data.npcId;	// int, реальное ид нпц. из таблицы всех нпц
	
	
	
	//TODO взятие данных типа логин и прочие
	this.userData.login = "npc"+this.userId;
	this.userData.lastActionTime = 0;
	
	//Флаги
	this.userData.inBattleFlag = false;
	this.userData.isAliveFlag = true;
	
	
	
	// Собираем статы игрока те что в базе
	this.getStats();
	
	// this.getItems();
	

	
	// пересчитываем статы игрока. с учетом всех данных
	this.recountStats();	
}



/*
	* Description:
	*	Собирает статы нпц которые есть в базе (Получаем их из массива информации о нпц)
	*	
	*	return: 
	*
	* @since  07.05.15
	* @author pcemma
*/
Npc.prototype.getStats = function()
{
	for (var key in GLOBAL.DATA.npcsInfo[this.npcId].stats){
		this.userData[key] = GLOBAL.DATA.npcsInfo[this.npcId].stats[key];
	}
}






/*****************	BATTLE	******************/


/*
	* Description:
	*	Листнер старта боя для нпц. ЗАпускает ИИ нашего нпц.
	*	
	*
	* @since  12.05.15
	* @author pcemma
*/
Npc.prototype.addToBattleListener = function()
{
	this.searchEnemyInArea();
}


/*
	* Description:
	*	Поиск врагов в области удара.
	*	
	*
	* @since  15.05.15
	* @author pcemma
*/
Npc.prototype.searchEnemyInArea = function()
{
	var currentTime = Math.floor(+new Date() / 1000);
	// TODO: Сделать поверку на то что бой еще идет. 
	if(
		this.userData.inBattleFlag && 					// Проверяем на то что герой этот в бою
		// this.userData.battleId == this.id &&			// Проверка что герой в этом самом бою
		this.isAlive() &&								// живой ли герой, мертвые не сражаются!
		this.userData.lastActionTime <= currentTime  	// Проверка на возможность делать удар, не включен ли таймаут
	){
		var hexesArray = battlesManager.searchEnemyInArea({id: this.userData.battleId, hexId: this.userData.hexId, userId: this.userId});
		console.log("\n\n============================");
		console.log(hexesArray);
		console.log("============================\n\n");
		// Проверяем вернулся ли нам массив. Если нет, то боя такого нет, нам более нет надобности заводить таймеры для нпц.
		if(hexesArray){
			console.log("TYT!");
			// Проверка на количество гексов с врагами.
			if(hexesArray.length >= 1){
				// Нашли врагов. 
				// TODO: Надо сделать проверку на поиск врага, самого близкого к герою.
				
			}
			else{
				// Врагов нет. Начинаем поиск свободных ячеек для перехода.
			}
			
			
			this.battleTimer = setTimeout(function(that){ that.searchEnemyInArea(); }, 2000, this);

			
			
		}
	}
}










module.exports = Npc;

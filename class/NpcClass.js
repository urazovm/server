console.log("Npc CLASS is connected");	

function Npc() {

	this.userId = 0;
	
	// USER DATA
	this.userData = {
						items: {}, 	// Предметы
						stuff: {}, 	// Надетые вещи
						stats: {} 	// Статы юзера
					};
}				

Npc.prototype = Object.create(UserClass.prototype);
Npc.prototype.constructor = Npc;





/*
	* Description:
	*	function Заполняем все необходимые данные в базе данных о новом нпц. 
	*	
	*
	*	@data:				array
	*		
	*
	*
	* @since  17.08.15
	* @author pcemma
*/
Npc.prototype.addDefaultUser = function(data, callback)
{
	this.npcId = data.npcId;
	
	Mongo.insert(
		"game_Npcs", 
		{
			userData: {
				npcId: data.npcId,
				login: GLOBAL.DATA.npcsInfo[data.npcId].name,
				lastActionTime: 0,
				inBattleFlag: false,
				isAliveFlag: true,
				items:{},
				stuff: {},
				stats: this.addDefaultStats()
			},
		}, 
		function(rows){
			this.userId = rows.ops[0]._id;
			callback();
		}.bind(this)); 		
}


/*
	* Description:
	*	Добавляем статы новому нпц
	*	
	*	
	*	return: array, массив с набором статов по умолчанию.
	*
	* @since  17.08.15
	* @author pcemma
*/
Npc.prototype.addDefaultStats = function()
{
	return GLOBAL.DATA.npcsInfo[this.npcId].stats;
}


/*
	* Description:
	*	Добавляем вещи новому нпц
	*	
	*	
	*
	* @since  10.08.15
	* @author pcemma
*/
Npc.prototype.addDefaultItems = function(callback)
{
	for(var i in GLOBAL.DATA.npcsInfo[this.npcId].items){
		var itemId = defaultItemsArray[i],
			inventorySlotArray = [];
		for(var inventorySlotId in GLOBAL.DATA.items[itemId].inventorySlots){
			inventorySlotArray.push(inventorySlotId);
		}	
		
		this.addItem({
			stats: GLOBAL.DATA.items[itemId].stats,
			itemId: itemId,
			count: 1,
			inventorySlotId: inventorySlotArray
		}, callback);
	}	
}









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
/*
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
*/


/*
	* Description:
	*	Собирает статы нпц которые есть в базе (Получаем их из массива информации о нпц)
	*	
	*	return: 
	*
	* @since  07.05.15
	* @author pcemma
*/
/*
Npc.prototype.getStats = function()
{
	this.userData.stats = GLOBAL.DATA.npcsInfo[this.npcId].stats;
}

*/


/*
	* Description:
	*	Собирает статы игрока которые есть в базе
	*	
	*	return: 
	*
	* @since  21.02.15
	* @author pcemma
*/
/*
Npc.prototype.recountStats = function()
{
	
	// minDamage
	this.userData.stats['minDamage'] = this.userData.stats['strength'];
	// maxDamage
	this.userData.stats['maxDamage'] = this.userData.stats['strength'] * 3;
	// hp
	this.userData.stats['hp'] = this.userData.stats['stamina'] * 8;
	// currentHp
	this.userData.stats['currentHp'] = this.userData.stats['stamina'] * 8;
}
*/





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
	*	Листнер окончания боя для нпц. 
	*		1. Останавливает таймеры
	*	
	*
	* @since  01.06.15
	* @author pcemma
*/
Npc.prototype.removeFromBattleListener = function()
{
	if(this.battleTimer){
		clearTimeout(this.battleTimer);
	}
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
		this.isAlive() 									// живой ли герой, мертвые не сражаются!
	){
		if(this.userData.lastActionTime <= currentTime ){ 	// Проверка на возможность делать удар, не включен ли таймаут
			var hexesArray = battlesManager.searchEnemyInArea({id: this.userData.battleId, hexId: this.userData.hexId, userId: this.userId});
			// Проверяем вернулся ли нам массив. Если нет, то боя такого нет, нам более нет надобности заводить таймеры для нпц.
			if(hexesArray){
				// Проверка на количество гексов с врагами.
				if(hexesArray.length >= 1){
					// Нашли врагов. 
					// TODO: Надо сделать проверку на поиск врага, самого близкого к герою.
					//TODO: переделать механизм выбора ячейки для передвижения, в данный момент это просто любая свободная ячейка.
					var enemyHexId = Math.floor((Math.random() * hexesArray.length));
					// Запоминаем гекс с врагом, который подошел по услвояим поиска. 
					this.userData.enemyHexId = hexesArray[enemyHexId];
					this.heroMakeHit();
				}
				else{
					// Врагов нет. Начинаем поиск свободных ячеек для перехода.
					this.findHexIdToMove();
				}
			}
		}
		else{
			console.log("else for searchEnemyInArea");
			this.battleTimer = setTimeout(this.searchEnemyInArea().bind(this), 500);
		}
	}
}


/*
	* Description:
	*	Поиск свободного гекса для перемещения
	*	
	*
	* @since  01.06.15
	* @author pcemma
*/
Npc.prototype.findHexIdToMove = function()
{
	var currentTime = Math.floor(+new Date() / 1000);
	// TODO: Сделать поверку на то что бой еще идет. 
	if(
		this.userData.inBattleFlag && 					// Проверяем на то что герой этот в бою
		// this.userData.battleId == this.id &&			// Проверка что герой в этом самом бою
		this.isAlive()									// живой ли герой, мертвые не сражаются!
	){
		if(this.userData.lastActionTime <= currentTime){  	// Проверка на возможность делать удар, не включен ли таймаут
			var hexesArray = battlesManager.searchFreeHexesInArea({id: this.userData.battleId, hexId: this.userData.hexId, userId: this.userId});
			// Проверяем вернулся ли нам массив. Если нет, то пустых гексовдля передвижения в области нет. 
			// Проверка на количество гексов для передвижения.
			if(hexesArray.length >= 1){
				//TODO: переделать механизм выбора гекса для передвижения, в данный момент это просто любая свободная ячейка.
				var hexToMoveId = Math.floor((Math.random() * hexesArray.length));
				battlesManager.moveHero({id: this.userData.battleId, hexId: hexesArray[hexToMoveId], userId: this.userId});			
				this.battleTimer = setTimeout(this.searchEnemyInArea.bind(this), this.userData.stats.moveActionTime * 1000);								
			}
			else{
				// Свободных гексов нет. Надо заново проверить область на поиск врага. 
				// Используем moveActionTime, потому что дейсвтие должно быть сделано по таймеру движения. 
				this.battleTimer = setTimeout(this.searchEnemyInArea().bind(this), this.userData.stats.hitActionTime * 1000);
			}	
		}
		else{
			console.log("else for findHexIdToMove");
			this.battleTimer = setTimeout(this.findHexIdToMove().bind(this), 500);
		}
	}
}


/*
	* Description:
	*	Совершение удара по врагу
	*	
	*
	* @since  01.06.15
	* @author pcemma
*/
Npc.prototype.heroMakeHit = function()
{
	var currentTime = Math.floor(+new Date() / 1000),
		isNpcHit = battlesManager.heroMakeHit({id: this.userData.battleId, hexId: this.userData.enemyHexId, userId: this.userId});
	if(isNpcHit){
		this.battleTimer = setTimeout(this.heroMakeHit.bind(this), this.userData.stats.hitActionTime * 1000);
	}
	else{
		this.battleTimer = setTimeout(this.searchEnemyInArea().bind(this), this.userData.stats.hitActionTime * 1000);
	}	
}




module.exports = Npc;

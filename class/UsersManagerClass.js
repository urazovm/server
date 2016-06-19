console.log("Users Manager CLASS is connected");

var async = require("async"),
	UserClass = require("./UserClass.js");

function UsersManagerClass() {
	this.USERS = {};
};


/*
	* Description:
	*	Add user to global array
	*	
	*	@user: object, type User
	*
	* @since  19.08.15
	* @author pcemma
*/
UsersManagerClass.prototype.addUserToGlobalUsersArray = function(user, callback) {
	console.log("addUserToGlobalUsersArray");
	this.USERS[user.userId] = user;
	callback();
};


/*
	* Description:
	*	Send data to users
	*	@data: obj
	*		@usersIdArr: 	arr, array of the users id.
	*		@data: 			obj, data to send to user.
	*
	*
	* @since  28.02.16
	* @author pcemma
*/
UsersManagerClass.prototype.sendDataToUsers = function(data) {
	var usersIdArr = data.usersIdArr;
	var sendData = data.data;
	usersIdArr.forEach(function(userId, index, array){
		if(userId in this.USERS) {
			this.USERS[userId].socketWrite(sendData);
		}
	}.bind(this));
};




/*
	* Description:
	* function that make user auth.
	*	
	*	@data: 	object, Data from client
	*	
	*
	* @since  07.03.16
	* @author pcemma
*/
UsersManagerClass.prototype.authorization = function(data) {
	var newUser = new UserClass(),
		queues = [
			newUser.check.bind(newUser, data),
			newUser.authorization.bind(newUser, data),
			this.addUserToGlobalUsersArray.bind(this, newUser)
		];
	async.waterfall(
		queues,
		function(err){
			console.log("authorization");
		}
	)
};



/*
	* Description:
	* function makes new user account and auth
	*	
	*	@data: 	object, Data from client
	*	
	*
	* @since  20.06.16
	* @author pcemma
*/
UsersManagerClass.prototype.createNewAccount = function(data) {
	var newUser = new UserClass(),
		queues = [
			newUser.createNewAccount.bind(newUser, data),
			newUser.authorization.bind(newUser, data),
			this.addUserToGlobalUsersArray.bind(this, newUser)
		];
	async.waterfall(
		queues,
		function(err){
			console.log("createNewAccount");
		}
	)
};


/*
	* Description:
	*	function that remove user from global array
	*	
	* @ userId - USER ID	
	*
	* @since  07.03.16
	* @author pcemma
*/
UsersManagerClass.prototype.removeUserFromServer = function (userId) {
	console.log("remove user", userId);
	if (this.USERS[userId]){
		// REMOVE USERS GROM ONLINE USERS OF STATE
		// delete GLOBAL.STATES[GLOBAL.USERS[userId].data.castle.K].users[userId];
	
		// CLEAR AREAS ARRAY FROM THIS USER
		// for (var areaId in GLOBAL.USERS[userId].usersAreas)
			// GLOBAL.removeUserFromAreasArray(areaId, userId);
	}		
	delete this.USERS[userId];		
};




/**************** Items ****************/

/*
	* Description:
	*	function Wear item on hero
	*	
	*	@data: 	object, Data from client
	*		@itemId: 	int, id of item from the users items table
	*	
	*
	* @since  07.03.16
	* @author pcemma
*/
UsersManagerClass.prototype.userWearOnItem = function(data) {
	if(data){
		this.USERS[data.userId].wearOnItem(data);
	}
};


/*
	* Description:
	*	function Wear off item hero
	*	
	*	@data: 	object, Data from client
	*		@itemId: 	int, id of item from the users items table
	*	
	*
	* @since  07.03.16
	* @author pcemma
*/
UsersManagerClass.prototype.userWearOffItem = function(data) {
	if(data){
		this.USERS[data.userId].wearOffItem(data);
	}
};




/*
	* Description:
	*	function Wear off item hero
	*	
	*	@data: 	object, Data from client
	*		@itemId: 	int, id of item from the users items table
	*	
	*
	* @since  07.03.16
	* @author pcemma
*/
UsersManagerClass.prototype.isUserVerified = function(userId, verifyHash) {
	return this.USERS[userId] && this.USERS[userId].verifyHash === verifyHash;
};




module.exports = new UsersManagerClass();
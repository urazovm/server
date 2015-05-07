console.log("Npc CLASS is connected");	

function Npc() {

	this.userId = 0;
	
	// USER DATA
	this.userData = {

					
				};
}				

Npc.prototype = Object.create(UserClass.prototype);
Npc.prototype.constructor = Npc;




module.exports = Npc;

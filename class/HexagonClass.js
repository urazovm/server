console.log("HexagonClass CLASS is connected");	

function HexagonClass(data) {

	
	/*
		* Description:
		*	function ������� ����
		*	
		*
		*
		* @since  08.02.15
		* @author pcemma
	*/
	HexagonClass.prototype.__constructor = function(data)
	{
		this.isFree = true;
		this.userId = false;
		this.x = data.x;
		this.y = data.y;
		
		if(data.isObstruction){
			this.isObstructions = true;
			this.isFree = false;
			this.obstructionId = Math.floor(Math.random() * (lib.objectSize(GLOBAL.DATA.battleInfo.obstructions) - 1 + 1)) + 1;
		}
	}
	
	
	/*
		* Description:
		*	function ��������� ����� � ����
		*	
		*	@data:			arr
		*		@userId:	str, id of the user
		*
		* @since  08.02.15
		* @author pcemma
	*/
	HexagonClass.prototype.addHero = function(data)
	{
		this.isFree = false;
		this.userId = String(data.userId);
	}
	
	
	/*
		* Description:
		*	function ������� ����� �� �����
		*	
		*
		*
		* @since  08.02.15
		* @author pcemma
	*/
	HexagonClass.prototype.removeHero = function(data)
	{
		this.isFree = true;
		this.userId = false;
	}
	
	this.__constructor(data);
}



module.exports = HexagonClass;
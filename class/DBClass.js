console.log("DB CLASS is connected");	
var mysql = require("mysql-libmysqlclient");

function DBClass(data) {
	this.connectionsCount = 5;
	this.bdList = {};
	
	data = data || {};	
	
	this.bd_name = data.bd_name || config.bd_config.bd_name;
	this.user_name = data.user_name || config.bd_config.user_name;
	this.user_password = data.user_password || config.bd_config.user_password;
	
	/*
		* Description:
		*	function create a mysql database connection.
		*	avail flag for connection: int; 0 - session is free, 1 - session is buzzy
		*	
		*	
		*
		* @since  08.02.14
		* @author pcemma
	*/
	this.createDbConnection = function()
	{	
		var conn = mysql.createConnectionSync();
		conn.connectSync('127.0.0.1', this.user_name, this.user_password, this.bd_name);
		conn.querySync("set names utf8");
		conn.avail = 0;
		return conn;
	}
	
	
	/*
		* Description:
		*	function create a list of connections and start mysql session
		*	
		*	
		*
		* @since  08.02.14
		* @author pcemma
	*/
	this.createBdList = function()
	{
		var temp_array = {};
		for (var i = 1; i < this.connectionsCount; i++ )
		{
			temp_array[i] = this.createDbConnection();
		}
		return temp_array;		
	}
	
	
	/*
		* Description:
		*	function ping mysql session for not loose connection
		*	
		*	
		*
		* @since  03.03.14
		* @author pcemma
	*/
	this.pingMysqlSession = function()
	{
		// console.log("pingMysqlSession is called!!!!");
		for(var key in this.bdList)
			this.bdList[key].querySync("SELECT `id` FROM  `game_Buildings` ");
		setTimeout(function(that){ that.pingMysqlSession() }, 600000, this);
	}
	
	
	/*
		* Description:
		*	function check what session is free and make db request on this session
		*	
		*
		*	@query:	str, a mysql query
		*
		*
		*	return: object, a query result
		*
		* @since  08.02.14
		* @author pcemma
	*/
	this.querySync = function(query)
	{
		if(query && query != "")
		{
			var n = 1;
			for(key in this.bdList)
			{
				if(this.bdList[key].avail == 0)
				{
					n = key;
					break;
				}
			}
			this.bdList[n].avail = 1;
			var a = this.bdList[n].querySync(query);
			this.bdList[n].avail = 0;
			return a;
		}
	}
	

	/*
		* Description:
		*	function check what session is free and make db request on this session
		*	
		*
		*	@query:	str, a mysql query
		*
		*
		*	return: object, a query result
		*
		* @since  08.02.14
		* @author pcemma
	*/
	this.lastInsertIdSync = function(query)
	{
		if(query && query != "")
		{
			var n = 1;
			for(key in this.bdList)
			{
				if(this.bdList[key].avail == 0)
				{
					n = key;
					break;
				}
			}
			this.bdList[n].avail = 1;
			var a = this.bdList[n].querySync(query);
			this.bdList[n].avail = 0;
			return this.bdList[n].lastInsertIdSync();
		}
	}
	
	
	/*
		* Description:
		*	function делает ескейп строки - защита от инъекций
		*	
		*
		*	@query:	str
		*
		*
		*	return: object, a query result
		*
		* @since  23.01.15
		* @author pcemma
	*/
	this.mysqlRealEscapeString = function(str) {
		return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
			switch (char) {
				case "\0":
					return "\\0";
				case "\x08":
					return "\\b";
				case "\x09":
					return "\\t";
				case "\x1a":
					return "\\z";
				case "\n":
					return "\\n";
				case "\r":
					return "\\r";
				case "\"":
				case "'":
				case "\\":
				case "%":
					return "\\"+char; // prepends a backslash to backslash, percent,
									  // and double/single quotes
			}
		});
	}
	
	
	// create a list of connections
	this.bdList = this.createBdList();
	// start check session connection
	this.pingMysqlSession();
}

module.exports = DBClass;

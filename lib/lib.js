console.log("lib package is connected");



exports.inArray = function in_array(needle, haystack, strict) 
{   
	// Checks if a value exists in an array
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    var found = false, key, strict = !!strict;
    for (key in haystack) {
        if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
            found = true;
            break;
        }
    }
    return found;
}


// Get the integer value of a variable
//
// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
exports.intval = function intval( mixed_var, base ) {   

    var tmp;
    if( typeof( mixed_var ) == 'string' ){
        tmp = parseInt(mixed_var);
        if(isNaN(tmp)){
            return 0;
        } else{
            return tmp.toString(base || 10);
        }
    } else if( typeof( mixed_var ) == 'number' ){
        return Math.floor(mixed_var);
    } else{
        return 0;
    }
}


// Join array elements with a string
//
// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// +   improved by: _argos
exports.implode = function implode( glue, pieces ) 
{  
	
    return ( ( pieces instanceof Array ) ? pieces.join ( glue ) : pieces );
}


// Split a string by string
//
// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// +   improved by: kenneth
// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
exports.explode = function explode( delimiter, string ) 
{ 
	
 
    var emptyArray = { 0: '' };
    if ( arguments.length != 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined' )
    {
        return null;
    }
    if ( delimiter === ''
        || delimiter === false
        || delimiter === null )
    {
        return false;
    }
    if ( typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object' )
    {
        return emptyArray;
    }
    if ( delimiter === true ) {
        delimiter = '1';
    }
    return string.toString().split ( delimiter.toString() );
}




exports.clone = function(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = exports.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = exports.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}



exports.objectSize = function(obj) {
    var size = 0, key;
	if(!obj)
		return size;
		
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};



Number.prototype.Crop = function (x){
    var s = this+'', a = s.split('.');
    a[1]=a[1]||'';      
    return parseFloat(a[0]+'.'+a[1].substring(0,x));
}



/*
	function return count of bytes in string
	
	example:
	var str = "string";
	console.log('Length: ', str.byteLength(), ' byte(s)');
*/
String.prototype.byteLength = function(){
	var str = this, length = str.length, count = 0, i = 0, ch = 0;
	for(i; i < length; i++){
		ch = str.charCodeAt(i);
		if (0xD800 <= ch && ch <= 0xDBFF) {
			// верхний вспомогательный
			var next = str.charCodeAt(i+1);
			ch += next;
			i++;
		}
		if(ch <= 127){
			count++;
		}else if(ch <= 2047){
			count += 2;
		}else if(ch <= 65535){
			count += 3;
		}else if(ch <= 2097151){
			count += 4;
		}else if(ch <= 67108863){
			count += 5;
		}else{
			count += 6;
		}    
	}
	return count;
};



/*
	function return number of elent by bytes
*/
String.prototype.NumberByByte = function(number_of_bytes){
	var str = this, length = str.length, count = 0, i = 0, ch = 0;
	for(i; i < length; i++){
		ch = str.charCodeAt(i);
		if (0xD800 <= ch && ch <= 0xDBFF) {
			// верхний вспомогательный
			var next = str.charCodeAt(i+1);
			ch += next;
			i++;
		}
		if(ch <= 127){
			count++;
		}else if(ch <= 2047){
			count += 2;
		}else if(ch <= 65535){
			count += 3;
		}else if(ch <= 2097151){
			count += 4;
		}else if(ch <= 67108863){
			count += 5;
		}else{
			count += 6;
		}
		if(count >= number_of_bytes)
			break;
	}
	return i+1;
};


exports.close_socket = function(soc) 
{
	if(soc.empty_connection)
	{
		soc.destroy(); 
	}
}


exports.return_bytes = function return_bytes(str)
{
	var temp0=''+str.byteLength()+'';
	while(temp0.length < 6) 
	{
		temp0 = '0'+temp0;
	}
	return temp0;
}



exports.validateEmail = function(email) { 
    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return re.test(email);
} 


exports.quickSort = function(arr, customSort)
{
	//if array is empty
	if (arr.length === 0) {
		return [];
	}
	
	if(!customSort) {
		customSort = function(a, b) {
			return a.value > b.value;
		};
	}	
	
	var left = [];
	var right = [];
	var pivot = arr[0];
	
	//go through each element in array
	for (var i = 1; i < arr.length; i++) {
		customSort(arr[i], pivot) ? left.push(arr[i]) : right.push(arr[i]);
	}
	return exports.quickSort(left).concat(pivot, exports.quickSort(right));
}



exports.getCountryByIp = function(ip)
{
	var geo = geoip.lookup(ip);
	var country = "";
	if (geo && geo.country)
		country = geo.country;
		
	return country;
}


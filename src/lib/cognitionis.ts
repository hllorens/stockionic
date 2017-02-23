export var cognitionis = {
    is_local: function(){
        if( /^file:\/{3}[^\/]/i.test(window.location.href) ){
            return true;
        }
        console.log('not local');
        return false;
    },
	encodeFully: function(s) {
		return encodeURIComponent(s).replace(/\./g, '%2E');
	},
	decode: function(s) {
		return decodeURIComponent(s);
	},
	encodeAFemail: function(s) {
        // NOTE: with agularfire2 (af) it decodes URIencoded and fails...
		return s.replace(/@gmail.com$/, '').replace(/\./g, '__p__');
	},
	decodeAFemail: function(s) {
		return s.replace(/__p__/g, '.')+'@gmail.com';
	},
    get_timestamp_str: function(){
        var timestamp=new Date();
        var timestamp_str=timestamp.getFullYear()+"-"+
            this.pad_string((timestamp.getMonth()+1),2,"0") + "-" + this.pad_string(timestamp.getDate(),2,"0") + " " +
             this.pad_string(timestamp.getHours(),2,"0") + ":"  + this.pad_string(timestamp.getMinutes(),2,"0") + 
                ":"  + this.pad_string(timestamp.getSeconds(),2,"0");
        return timestamp_str;
    },
    pad_string: function (val, digits, pad_char){
        var val_str = val + "", pad_str=""
        if(val_str.length < digits){
            for(var i=digits-1;i>0;i--)pad_str+=pad_char
            return pad_str + val_str;
       }else
            return val_str;
    },
    objectLength: function (obj) {
        var result = 0;
        for(var prop in obj) {
            if (obj.hasOwnProperty(prop)) { 
                result++;
            }
        }
        return result;
    },
    isNumber: function(value) {
        if ((undefined === value) || (null === value)) return false;
        if (typeof value == 'number')  return true;
        return !isNaN(value - 0);
    }
};

//export 

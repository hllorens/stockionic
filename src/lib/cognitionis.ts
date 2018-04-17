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
    },
    
    getStockIndex:function(arr, symbol){
        if(!arr){return -1;} // seems that sometimes it is empty (refresh)
        for(let i=0;i<arr.length;i++){
            if(symbol==arr[i].name+':'+arr[i].market){
                return i;
            }
        }
        return -1;
    },
    getStock:function (arr,symbol){
        let index=this.getStockIndex(arr, symbol);
        if(index==-1) return;
        else return arr[index];
    },
    toFixed:function(value,decimals) {
        return parseFloat(value).toFixed(decimals);
    },
    toFixed2:function(value) {
        return parseFloat(value).toFixed(2);
    },
    mult100:function(value) {
        return (parseFloat(value)*100).toFixed(0);
    },
    mult100_fix2:function(value) {
        return (parseFloat(value)*100).toFixed(2);
    },
    mult100float:function(value) {
        return (parseFloat(value)*100);
    },
    usd_market:function(value){
        if(value=="NASDAQ" || value=="NYSE"){return true;}
        else{return false;}
    },
    redux_format:function(value) {
        if(parseFloat(value)>100) return parseFloat(value).toFixed(0);
        if(parseFloat(value)<100 && parseFloat(value)>=10) return parseFloat(value).toFixed(1);
        return value;
    },
    redux_format_max:function(value) {
        if(parseFloat(value)>1000) return (parseFloat(value)/1000).toFixed(0)+"k";
        if(parseFloat(value)>10) return parseFloat(value).toFixed(0);
        if(parseFloat(value)<10 && parseFloat(value)>=10) return parseFloat(value).toFixed(1);
        return value;
    },
    addx:function(value,addition,decimals) {
        if(typeof(decimals)=='undefined') decimals=2;
        return (parseFloat(value)+addition).toFixed(decimals);
    },
    max:function(value,max,decimals) {
        if(typeof(max)=='undefined') max=100;
        if(typeof(decimals)=='undefined') decimals=2;
        return (Math.max(parseFloat(value),max)).toFixed(decimals);
    },
    min:function(value,min,decimals) {
        if(typeof(min)=='undefined') min=0;
        if(typeof(decimals)=='undefined') decimals=2;
        return (Math.min(parseFloat(value),min)).toFixed(decimals);
    },
    avg_arr:function(arr){
        return arr.reduce(function(a, b) { return a + b; })/arr.length;
    },
    avg_arr_limit:function(arr,min,max){
        var sum = 0;
        for( var i = 0; i < arr.length; i++ ){
            sum += Math.min(Math.max(arr[i], min ),max); 
        }
        return sum/arr.length;
    },
    sd_arr_limit:function(arr,min,max,avgl){
        var sum = 0;
        for( var i = 0; i < arr.length; i++ ){
            sum += Math.pow(Math.min(Math.max(arr[i], min ),max)-avgl,2); 
        }
        return Math.sqrt(sum/(arr.length-1));
    }
};

//export 

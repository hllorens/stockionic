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
    get_year_2: function(timestamp_str){
        if (timestamp_str.length>=4)
            return timestamp_str.substr(2,2);
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
    },
    get_anualized_data:function (param, stock_data, tsv_arr) {
        if (stock_data.hasOwnProperty(param + "_hist")) {
            var i;
            i = 0;
            var val_g;
            val_g = this.hist_growth_array(param + "_hist", stock_data);
            var val_a;
            val_a = this.acceleration_array(val_g);
            tsv_arr[param[0] + "gl"] = val_g[val_g.length - 1];
            tsv_arr[param[0] + "ga"] = this.avg_weighted(val_g);
            tsv_arr[param[0] + "aa"] = this.avg_weighted(val_a);
            var seen_years;
            seen_years = {};
            for (var _key_ in stock_data[param + "_hist"]) {
                if (stock_data[param + "_hist"].hasOwnProperty(_key_)) { 
                    var valdata;
                    valdata = stock_data[param + "_hist"][_key_];
                    //console.log(valdata[0]);
                    if (seen_years.hasOwnProperty(valdata[0].substr(0, 4))) {
                        var param_hist;
                        console.log("ERROR duplicated year in " + param_hist + " "
                            +valdata[0].substr(0, 4) + "<br />");
                        return tsv_arr;
                    }
                    seen_years[valdata[0].substr(0, 4)] = true;
                    if(!tsv_arr.hasOwnProperty(valdata[0].substr(0, 4)))
                        tsv_arr[valdata[0].substr(0, 4)]={};
                    tsv_arr[valdata[0].substr(0, 4)][param] = valdata[1];
                    tsv_arr[valdata[0].substr(0, 4)][param + "_ps"] = parseFloat(this.toFixed(parseFloat(valdata[1]) / parseFloat(stock_data["shares"]), 2));
                    tsv_arr[valdata[0].substr(0, 4)][param + "_psp"] = this.toFixed(tsv_arr[valdata[0].substr(0, 4)][param + "_ps"] / parseFloat(tsv_arr[valdata[0].substr(0, 4)]["value"]), 2);
                    if (tsv_arr.hasOwnProperty(valdata[0].substr(0, 4))) {
                        if (i == 0) {
                            tsv_arr[valdata[0].substr(0, 4)][param + "_g"] = 0;
                            tsv_arr[valdata[0].substr(0, 4)][param + "_a"] = 0;
                        } else {
                            if (i == 1) {
                                tsv_arr[valdata[0].substr(0, 4)][param + "_g"] = val_g[i - 1];
                                tsv_arr[valdata[0].substr(0, 4)][param + "_a"] = 0;
                            } else {
                                tsv_arr[valdata[0].substr(0, 4)][param + "_g"] = val_g[i - 1];
                                tsv_arr[valdata[0].substr(0, 4)][param + "_a"] = val_a[i - 2];
                            }
                        }
                    } else {
                        console.log("ERROR: in " + param + ", year "
                            +valdata[0].substr(0, 4) + " is not in tsv_arr<br />");
                        return tsv_arr;
                    }
                    i++;
                }
            }
        } else {
            console.log("<br />ERR: no " + param + " in stock_data<br />");
        }
        return tsv_arr;
    },
    compound_interest_4:function (principal, interest, years) {
        return parseFloat(this.toFixed(principal * Math.pow(1 + parseFloat(interest) / 4, years * 4), 2));
    },
    compound_average_growth:function (fromval, to, periods) {
        if (typeof periods == 'undefined') periods = 1.0;
        var cag;
        cag = 0.0;
        fromval = parseFloat(fromval);
        to = parseFloat(to);
        periods = parseFloat(periods);
        if (fromval == to) {
            //echo "<br />cag: fromval=to";
            return 0;
        }
        // no diff no calc
        if (fromval == 0) {
            //echo "<br />cag: fromval=0";
            fromval = 0.01;
        }
        // protection against 0 division
        cag = to / fromval;
        if (fromval < 0 || to < 0) {
            cag = (to - fromval) / Math.max(0.5, Math.abs(fromval));
            cag = cag + 1;
            // to pow it if needed
        }
        //echo "<br />fromval=$fromval,to=$to,cag=$cag";
        if (periods > 1) {
            cag = Math.pow(cag, 1.0 / periods);
        }
        //echo "<br />cag=$cag";
        cag = cag - 1;
        return cag;
    },
    acceleration_array:function (growth_array) {
        var acceleration_array;
        acceleration_array = [];
        if (growth_array.length <= 1) {
            acceleration_array[0] = 0;
            return acceleration_array;
        }
        for (var i = 0; i < growth_array.length - 1; i++) {
            acceleration_array.push(parseFloat(this.toFixed(growth_array[i + 1] - growth_array[i], 2)));
        }
        return acceleration_array;
    },
    hist_growth_array:function (param_id, symbol_object, num_periods) {
        if (typeof num_periods == 'undefined') num_periods = -1;
        var growth_array;
        growth_array = [];
        if (!symbol_object.hasOwnProperty(param_id)) {
            console.log("ERROR: In hist_growth_array() the param_id (" + param_id + ") does not exist");
            return growth_array;
        }
        var hist;
        hist = symbol_object[param_id];
        var hist_count;
        hist_count = hist.length - 1;
        if (num_periods == -1) {
            num_periods = hist_count;
        }
        // with 6 elems we can compute 5 periods
        if (hist_count < 1) {
            growth_array[0] = 0;
            return growth_array;
        }
        for (var i = hist_count - num_periods; i < hist_count; i++) {
            var from_val;
            from_val = parseFloat(symbol_object[param_id][0][1]);
            var to_val;
            to_val = parseFloat(symbol_object[param_id][0][1]);
            if (i >= 0) {
                from_val = parseFloat(symbol_object[param_id][i][1]);
                to_val = parseFloat(symbol_object[param_id][i + 1][1]);
            }
            growth_array.push(parseFloat(this.toFixed(this.compound_average_growth(parseFloat(this.toFixed(from_val, 3)), parseFloat(this.toFixed(to_val, 3))), 2)));
        }
        return growth_array;
    },
    avg_weighted:function (arr, percent_weight) {
        if (typeof percent_weight == 'undefined') percent_weight = 0.66;
        if (arr.length < 1) {
            return 0;
        }
        var avgw;
        avgw = 0;
        var curr_weight;
        curr_weight = 1;
        var total_elems_weight;
        total_elems_weight = 0;
        for (var i = 0; i < arr.length; i++) {
            total_elems_weight += curr_weight;
            avgw += parseFloat(arr[i]) * curr_weight;
            curr_weight = curr_weight + curr_weight * percent_weight;
        }
        avgw = avgw / total_elems_weight;
        return parseFloat(this.toFixed(avgw, 2));
    }
};

//export 

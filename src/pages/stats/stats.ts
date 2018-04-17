import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
//import { PlatformLocation } from '@angular/common'

import { MyFireAuth } from '../../providers/myfireauth';
import {cognitionis} from '../../lib/cognitionis.ts';
import firebase from 'firebase'

import { Stock } from '../../models/stock';
import { CognitionisStocks } from '../../providers/cognitionis-stocks';

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})

export class StatsPage {
  stocks: Stock[];
  all_stocks: Stock[];
  encuser: string = null;
  stats: any= {};
  stats_string: string;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private cognitionisStocks: CognitionisStocks,public myfireauth: MyFireAuth, public cd: ChangeDetectorRef) { //,public location: PlatformLocation
    cognitionisStocks.load().subscribe(result => {
      console.log('pulling stocks');
      this.all_stocks=result;
      this.initializeItems();
      this.calculations('epsp',-1,0.5);
      this.calculations('leverage',1,15);
      this.calculations('price_to_book',0.01,10);
      this.stats_string=JSON.stringify(this.stats, null, 3);
    });
    // does not work location.onPopState(() => {  console.log('pressed back detecting changes!');   this.check_alerts();this.cd.detectChanges(); });
  }



  ngOnInit(){
    if(this.myfireauth.user){
        this.encuser=cognitionis.encodeAFemail(this.myfireauth.user.email);
        console.log(this.encuser);
    }
  }
  

  calculations(variable,min,max){
    if(!this.all_stocks) return;
    this.stats[variable]={'total':0,'avg':0,'min':0,'max':0,'median':0};
    var values=[];
    var values_names={};
    for(var i=0;i<this.all_stocks.length;i++){
        console.log('calculations'+i);
        if(this.all_stocks[i].market.substring(0,5)=='INDEX'){
            continue;
        }
        if(this.all_stocks[i][variable]){
            values.push(parseFloat(this.all_stocks[i][variable]));
            values_names[this.all_stocks[i].name]=parseFloat(this.all_stocks[i][variable]);
            console.log(''+this.all_stocks[i].name);
        }
    }
    if(values.length>2){
        this.stats[variable].total=values.length;
        // sort
        values.sort(function(a, b){return a - b});
        var keysSorted = Object.keys(values_names).sort(function(a,b){return values_names[a]-values_names[b]});
        //debug 
        this.stats[variable].values=values;
        // get the median, min, max
        this.stats[variable].min=values[0].toFixed(2)+"|"+values[1].toFixed(2)+"|"+values[2].toFixed(2);
        this.stats[variable].min_name=keysSorted[0]+"|"+keysSorted[1]+"|"+keysSorted[2];
        this.stats[variable].median=values[Math.round(values.length/2)-1].toFixed(2)+"|"+values[Math.round(values.length/2)].toFixed(2)+"|"+values[Math.round(values.length/2)+1].toFixed(2);
        this.stats[variable].median_name=keysSorted[Math.round(values.length/2)-1]+"|"+keysSorted[Math.round(values.length/2)]+"|"+keysSorted[Math.round(values.length/2)+1];
        this.stats[variable].max=values[values.length-3].toFixed(2)+"|"+values[values.length-2].toFixed(2)+"|"+values[values.length-1].toFixed(2);
        this.stats[variable].max_name=keysSorted[values.length-3]+"|"+keysSorted[values.length-2]+"|"+keysSorted[values.length-1];
        // average, typical deviation
        this.stats[variable].avg=parseFloat(cognitionis.avg_arr(values).toFixed(2));
        this.stats[variable].avgl=parseFloat(cognitionis.avg_arr_limit(values,min,max).toFixed(2));
        this.stats[variable].sd=cognitionis.sd_arr_limit(values,min,max,this.stats[variable].avgl).toFixed(2);
    }
    console.log(JSON.stringify(this.stats, null, 4));
  }
  
  initializeItems(){
    //console.log('initializeItems() start');
    this.stocks=this.all_stocks;
    //console.log('initializeItems() end');
  }



  
}

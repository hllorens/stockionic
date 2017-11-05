import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, Platform } from 'ionic-angular';
import { AngularFire } from 'angularfire2'; //FirebaseListObservable
//import {GooglePlus} from 'ionic-native';
//import firebase from 'firebase'

import { MyFireAuth } from '../../providers/myfireauth';
//import {cognitionis} from '../../lib/cognitionis.ts';

import { Stock } from '../../models/stock';
import { CognitionisStocks } from '../../providers/cognitionis-stocks';


//import { StocksPage } from '../stocks/stocks';
//import { ProvatablePage } from '../provatable/provatable';
//import { AlertsPage } from '../alerts/alerts';

@Component({
  selector: 'page-extra',
  templateUrl: 'extra.html'
})
export class ExtraPage {
  stocks: any [];
  all_stocks: any [];
  
  
  goog: any;    // TODO ANAYZE WHY IT DOES NOT WORK LIKE THIS
  usdeur: any;
  usdeur_change: any;
  usdeur_hist: any;
  usdeur_hist_last_diff: any;
  usdeur_hist_trend: any;
  avgusdeur: any;

  
  btcusd: any;
  btcusd_change: any;
  btcusd_hist: any;
  btcusd_hist_last_diff: any;
  btcusd_hist_trend: any;
  avgbtcusd: any;
  
//  "usdeur_hist_last_diff":"2","btcusd_hist":[["2017-03-31",1088],["2017-06-31",2457],["2017-09-31",4156],["2017-11-04",7364.69]],"btcusd_hist_last_diff":"77","avgusdeur":"0.88","usdeur_hist_trend":"v","avgbtcusd":"3766.42","btcusd_hist_trend":"\/"
  
  //public navParams: NavParams,
  constructor(public navCtrl: NavController, private cognitionisStocks: CognitionisStocks,public myfireauth: MyFireAuth) { //,public location: PlatformLocation
    cognitionisStocks.load().subscribe(result => {
      console.log('pulling stocks');
      this.all_stocks=result;
      this.initializeItems();
      
      this.goog=(this.getStock('GOOG:NASDAQ'));
      
      
      this.usdeur=(this.getStock('GOOG:NASDAQ')).usdeur;
      this.usdeur_change=(this.getStock('GOOG:NASDAQ')).usdeur_change;
      this.usdeur_hist=(this.getStock('GOOG:NASDAQ')).usdeur_hist;
      this.usdeur_hist_last_diff=(this.getStock('GOOG:NASDAQ')).usdeur_hist_last_diff;
      this.usdeur_hist_trend=(this.getStock('GOOG:NASDAQ')).usdeur_hist_trend;
      this.avgusdeur=(this.getStock('GOOG:NASDAQ')).avgusdeur;

      this.btcusd=(this.getStock('GOOG:NASDAQ')).btcusd;
      this.btcusd_change=(this.getStock('GOOG:NASDAQ')).btcusd_change;
      this.btcusd_hist=(this.getStock('GOOG:NASDAQ')).btcusd_hist;
      this.btcusd_hist_last_diff=(this.getStock('GOOG:NASDAQ')).btcusd_hist_last_diff;
      this.btcusd_hist_trend=(this.getStock('GOOG:NASDAQ')).btcusd_hist_trend;
      this.avgbtcusd=(this.getStock('GOOG:NASDAQ')).avgbtcusd;

    });
  }


  ngOnInit(){

  }
  
  getStockIndex(symbol){
    if(!this.all_stocks){return -1;} // seems that sometimes it is empty (refresh)
    for(let i=0;i<this.all_stocks.length;i++){
        if(symbol==this.all_stocks[i].name+':'+this.all_stocks[i].market){
            return i;
        }
    }
    return -1;
  }
  
  getStock(symbol){
    let index=this.getStockIndex(symbol);
    if(index==-1) return;
    else return this.all_stocks[index];
  }
  initializeItems(){
    //console.log('initializeItems() start');
    this.stocks=this.all_stocks;
    //console.log('initializeItems() end');
  }
  public toFixed2(value) {
    return parseFloat(value).toFixed(2);
  }
  public mult100(value) {
    return (parseFloat(value)*100).toFixed(0);
  }

  
  
}

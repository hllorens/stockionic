import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { AngularFire } from 'angularfire2'; //FirebaseListObservable
//import {GooglePlus} from 'ionic-native';
//import firebase from 'firebase'

import { MyFireAuth } from '../../providers/myfireauth';
import {cognitionis} from '../../lib/cognitionis.ts';

//import { Stock } from '../../models/stock';
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
  constructor(public navCtrl: NavController, public myfireauth: MyFireAuth, public cognitionisStocks: CognitionisStocks,) { //,public location: PlatformLocation, 
    cognitionisStocks.load().subscribe(result => {
      console.log('pulling stocks');
      this.all_stocks=result;
      this.initializeItems();
      
      this.goog=(cognitionis.getStock(this.all_stocks,'GOOG:NASDAQ'));
      
      
      this.usdeur=this.goog.usdeur;
      this.usdeur_change=this.goog.usdeur_change;
      this.usdeur_hist=this.goog.usdeur_hist;
      //this.avgusdeur=(this.getStock('GOOG:NASDAQ')).avgusdeur;



    });
  }


  ngOnInit(){

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

import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { MyFireAuth } from '../../providers/myfireauth';
import {cognitionis} from '../../lib/cognitionis.ts';
import firebase from 'firebase'

import { Stock } from '../../models/stock';
import { CognitionisStocks } from '../../providers/cognitionis-stocks';
//import { OrderBy } from '../../pipes/orderby';
//import { ProgressBarComponent } from '../../components/progress-bar/progress-bar';

import { StockDetailsPage } from '../stock-details/stock-details';

@Component({
  selector: 'page-stocks',
  templateUrl: 'stocks.html'
})
export class StocksPage {
  stocks: Stock[];
  all_stocks: Stock[];
  searchQuery: string = '';
  orderByField = '-yield_per_ratio +range_52week_heat';
  reverseSort = '-';
  encuser: string = null;
  alerts: any = {};  //=[]   does not help
  alertsref: any;
  test_var: string = null;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private cognitionisStocks: CognitionisStocks,public myfireauth: MyFireAuth, public cd: ChangeDetectorRef) {
    cognitionisStocks.load().subscribe(result => {
      this.all_stocks=result;
      this.initializeItems();
    });
  }
  
  ngOnInit(){
    if(this.myfireauth.user){
        this.encuser=cognitionis.encodeAFemail(this.myfireauth.user.email);
        console.log(this.encuser);
    }
    this.alertsref = firebase.database().ref('alerts/'+this.encuser);
    this.alertsref.on('value', snap => {
      console.log('data received');
      this.alerts={}; // re-init
      snap.forEach( alert => {
          let al=alert.val();
          if(al.hasOwnProperty('symbol')){
              console.log('key '+al.symbol);
              this.alerts[al.symbol]=al;
              this.check_alert(al);
              //BKIA:BME 0.65 1.50  -5 5 0 10 2017-02-04 
          }
        });
      console.log('data received2'+cognitionis.get_timestamp_str());
      console.log('active page:'+this.navCtrl.getActive().component);
      let activeView = this.navCtrl.getActive();
      if (activeView.component == StocksPage) {
      //if(this.navCtrl.getActive().name === 'StocksPage'){
        console.log('detecting changes');
        this.cd.detectChanges(); // this fixes the issue, triggers change detection
        // seems to not work in Android??? perhaps add some badge... to see
      }
    });
  }
  
  public first_char(value) {
    return value[0];
  }

  getStock(symbol){
    if(!this.all_stocks){return;} // seems that sometimes it is empty (refresh)
    for(let i=0;i<this.all_stocks.length;i++){
        if(symbol==this.all_stocks[i].name+':'+this.all_stocks[i].market){
            return this.all_stocks[i];
        }
    }
    return;
  }
  
  check_alert(al){
    let stock=this.getStock(al.symbol);
    if(!stock) return;
    this.alerts[al.symbol].active=false;
    if(al.low && al.low>=stock.value){
        this.alerts[al.symbol].active=true;
        console.log('low');
        return;
    }
    if(al.high && parseFloat(al.high)<=parseFloat(stock.value)){
        this.alerts[al.symbol].active=true;
        console.log('high');
        return;
    }
    if(al.low_change_percentage && parseFloat(al.low_change_percentage)>=parseFloat(stock.session_change_percentage)){
        this.alerts[al.symbol].active=true;
        console.log('lowc'+al.low_change_percentage+"  "+stock.session_change_percentage);
        return;
    }
    if(al.high_change_percentage && parseFloat(al.high_change_percentage)<=parseFloat(stock.session_change_percentage)){
        this.alerts[al.symbol].active=true;
        console.log('highc');
        return;
    }
    if(al.low_yield && parseFloat(al.low_yield)>=parseFloat(stock.yield)){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.high_yield && parseFloat(al.high_yield)<=parseFloat(stock.yield)){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.low_per && parseFloat(al.low_per)>=parseFloat(stock.per)){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.high_per && parseFloat(al.high_per)<=parseFloat(stock.per)){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.low_eps && parseFloat(al.low_eps)>=parseFloat(stock.eps)){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.high_eps && parseFloat(al.high_eps)<=parseFloat(stock.eps)){
        this.alerts[al.symbol].active=true;
        return;
    }
  }
  
  itemTapped(event, stock, alert) {
    this.navCtrl.push(StockDetailsPage, {
          stock: stock,
          alert: alert
    });
  }
  
  initializeItems(){
    this.stocks=this.all_stocks;
  }
  public toFixed2(value) {
    return parseFloat(value).toFixed(2);
  }
  public mult100(value) {
    return (parseFloat(value)*100).toFixed(0);
  }
  reorder(ev: any, val:string){
    if(this.reverseSort=='+') this.reverseSort='-';
    else this.reverseSort='+';
    this.orderByField = this.reverseSort+val;
  }
  reorder_asc(ev: any, val:string){
    this.reverseSort='+';
    this.orderByField = this.reverseSort+val;
  }
  reorder_desc(ev: any, val:string){
    this.reverseSort='-';
    this.orderByField = this.reverseSort+val;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StocksPage');
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.stocks = this.stocks.filter((item) => {
        return ((item.name+item.market).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  
}

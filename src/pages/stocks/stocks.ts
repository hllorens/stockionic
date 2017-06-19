import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
//import { PlatformLocation } from '@angular/common'

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
  alert_filter_on: boolean=false;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private cognitionisStocks: CognitionisStocks,public myfireauth: MyFireAuth, public cd: ChangeDetectorRef) { //,public location: PlatformLocation
    cognitionisStocks.load().subscribe(result => {
      console.log('pulling stocks');
      this.all_stocks=result;
      this.initializeItems();
      this.check_alerts();
    });
    // does not work location.onPopState(() => {  console.log('pressed back detecting changes!');   this.check_alerts();this.cd.detectChanges(); });
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
              //if(this.alerts[al.symbol].active==true) this.all_stocks[this.getStockIndex(al.symbol)].alerted=true;
              //BKIA:BME 0.65 1.50  -5 5 0 10 2017-02-04 
          }
        });
      console.log('data received2'+cognitionis.get_timestamp_str());
      console.log('active page:'+this.navCtrl.getActive().name); // only log, .name does not work in prod
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
  check_alerts(){
    if(!this.alerts) return;
    for(var i=0;i<this.alerts.length;i++){
        this.check_alert(this.alerts[i]);
    }
  }
  check_alert(al){
    let stock=this.getStock(al.symbol);
    if(!stock) return;
    this.alerts[al.symbol].active=false;
    
    if(al.low && parseFloat(al.low)>=parseFloat(stock.value)){
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
    
    if(al.low_sell && parseFloat(al.low_sell)>=parseFloat(stock.value)){
        this.alerts[al.symbol].active=true;
        console.log('low_sell');
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
  public addx(value,addition,decimals) {
    if(typeof(decimals)=='undefined') decimals=2;
    return (parseFloat(value)+addition).toFixed(decimals);
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
  
  reorder_per_eps(ev: any){
    if(this.orderByField!='+per'){
        this.reverseSort='+';
        this.orderByField = this.reverseSort+'per';
    }else{
        this.reverseSort='-';
        this.orderByField = this.reverseSort+'eps_hist_last_diff';
    }
  }
  
  reorder_52_heat_vol(ev:any){
    if(this.orderByField.substring(1).split(' ')[0]!='range_52week_heat'){
        this.reverseSort='+';
        this.orderByField = this.reverseSort+'range_52week_heat';
    }else if(this.orderByField.split(' ')[0]=='+range_52week_heat'){
        this.reverseSort='-';
        this.orderByField = this.reverseSort+'range_52week_heat';
    }else{
        this.reverseSort='-';
        this.orderByField = this.reverseSort+'range_52week_volatility';
    }
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
        return ((item.name+item.market).toLowerCase().indexOf(val.toLowerCase()) > -1 || (item.title).toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }
  
  showAlerted(){
    // Reset items back to all of the items
    this.initializeItems();
    if(this.alert_filter_on){
        this.orderByField = '-yield_per_ratio +range_52week_heat';
        this.reverseSort = '-';
        this.alert_filter_on=false;return;
    }
    this.orderByField='none';this.reverseSort='';
    this.alert_filter_on=true;
    if(!this.alerts){this.stocks=[];return;}
    let alerted = this.stocks.filter((item) => {
        if(this.alerts.hasOwnProperty(item.name+":"+item.market))
            return (this.alerts[item.name+":"+item.market].active);
        return false;
    });
    let not_alerted=this.stocks.filter((item) => {
        if(this.alerts.hasOwnProperty(item.name+":"+item.market))
            return (!this.alerts[item.name+":"+item.market].active);
        return false;
    });
    this.stocks=alerted.concat(not_alerted);
  }

  
}

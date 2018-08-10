import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
//import { PlatformLocation } from '@angular/common'

import { MyFireAuth } from '../../providers/myfireauth';
import {cognitionis} from '../../lib/cognitionis.ts';
import firebase from 'firebase'

import { Stock } from '../../models/stock';
//import { CognitionisStocks } from '../../providers/cognitionis-stocks';
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
//  orderByField = '-avgyield_per_ratio +range_52week_heat';
  orderByField = '-h_souce +range_52week_heat';
  reverseSort = '-';
  encuser: string = null;
  alerts: any = {};  //=[]   does not help
  alertsref: any;
  firestocksref: any;
  test_var: string = null;
  alert_filter_on: boolean=false;
  usdeur: any;
  last_updated:any;
  cognitionis:any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public myfireauth: MyFireAuth, public cd: ChangeDetectorRef) { //,public location: PlatformLocation, public cognitionis: cognitionis,  private cognitionisStocks: CognitionisStocks
    this.cognitionis=cognitionis;
    /*cognitionisStocks.load().subscribe(result => {
      console.log('pulling stocks');
      this.all_stocks=result;
      this.initializeItems();
      this.usdeur=(cognitionis.getStock(this.all_stocks,'GOOG:NASDAQ')).usdeur;
      this.last_updated=(cognitionis.getStock(this.all_stocks,'GOOG:NASDAQ')).date;
      this.check_alerts();
    });*/
	
    // does not work 
	//location.onPopState(() => {  console.log('pressed back detecting changes!');   
	//this.check_alerts();
	//this.cd.detectChanges(); 
	//});
  }



  ngOnInit(){
    if(this.myfireauth.user){
        this.encuser=cognitionis.encodeAFemail(this.myfireauth.user.email);
        console.log(this.encuser);
    }
    this.firestocksref = firebase.database().ref('stocks_formatted/');
    this.firestocksref.on('value', snap => {
		console.log('stocks received');
		this.all_stocks=snap;
		this.all_stocks=[]; // re-init
		snap.forEach( stock => {
		  let al=stock.val();
		  if(al.hasOwnProperty('name')){
			  this.all_stocks.push(al);
			  //if(all_stocks.alerts[al.symbol].active==true) this.all_stocks[cognitionis.getStockIndex(this.all_stocks,al.symbol)].alerted=true;
			  //BKIA:BME 0.65 1.50  -5 5 0 10 2017-02-04 
		  }
		});
		this.initializeItems();
		this.usdeur=(cognitionis.getStock(this.all_stocks,'GOOG:NASDAQ')).usdeur;
		this.last_updated=(cognitionis.getStock(this.all_stocks,'GOOG:NASDAQ')).date;
		this.alertsref = firebase.database().ref('alerts/'+this.encuser);
		this.alertsref.on('value', snap => {
		  console.log('data received');
		  this.alerts={}; // re-init
		  snap.forEach( alert => {
			  let al=alert.val();
			  if(al.hasOwnProperty('symbol')){
				  //console.log('key '+al.symbol);
				  this.alerts[al.symbol]=al;
				  this.check_alert(al);
				  //if(this.alerts[al.symbol].active==true) this.all_stocks[cognitionis.getStockIndex(this.all_stocks,al.symbol)].alerted=true;
				  //BKIA:BME 0.65 1.50  -5 5 0 10 2017-02-04 
			  }
			});
		  console.log('data received2'+cognitionis.get_timestamp_str());
		  console.log('active page:'+this.navCtrl.getActive().name); // only log, .name does not work in prod
		  let activeView = this.navCtrl.getActive();
		  if (activeView.component == StocksPage) {   //if(this.navCtrl.getActive().name === 'StocksPage')
			console.log('detecting changes');
			this.cd.detectChanges(); // this fixes the issue, triggers change detection
			// seems to not work in Android??? perhaps add some badge... to see
		  }
		});
    });
  }

  initializeItems(){
    //console.log('initializeItems() start');
    this.stocks=this.all_stocks;
    //console.log('initializeItems() end');
  }

  
  public first_char(value) {
    return value[0];
  }
  

  check_alerts(){
    if(!this.alerts) return;
    for(var i=0;i<this.alerts.length;i++){
        console.log('check_alerts'+i);
        this.check_alert(this.alerts[i]);
    }
  }
  check_alert(al){
    let stock=cognitionis.getStock(this.all_stocks,al.symbol);
    if(!stock) return;
    this.alerts[al.symbol].active=false;
    
    if(al.low && parseFloat(al.low)>=parseFloat(stock.value)){
        this.alerts[al.symbol].active=true;
        //console.log('low');
        return;
    }
    if(al.high && parseFloat(al.high)<=parseFloat(stock.value)){
        this.alerts[al.symbol].active=true;
        //console.log('high');
        return;
    }

    if(al.lowe && parseFloat(al.lowe)>=parseFloat(this.usd2eur(stock.value))){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.highe && parseFloat(al.highe)<=parseFloat(this.usd2eur(stock.value))){
        this.alerts[al.symbol].active=true;
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
    
    if(al.low_epsp && parseFloat(al.low_epsp)>=parseFloat(stock.epsp)){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.high_epsp && parseFloat(al.high_epsp)<=parseFloat(stock.epsp)){
        this.alerts[al.symbol].active=true;
        return;
    }
    if(al.portf && (
        ( !cognitionis.usd_market(stock.market) && (parseFloat(al.portf)*0.8)>=parseFloat(stock.value) ) ||
        (  cognitionis.usd_market(stock.market) && parseFloat(this.eur2usd(parseFloat(al.portf)*0.8))>=parseFloat(stock.value) )
    )){ //*0.8 to see stop loss diff, note usdeur market
        this.alerts[al.symbol].active=true;
        //console.log('portf '+al.symbol);
        return;
    }
  }
  
  itemTapped(event, stock, alert, usdeur) {
    this.navCtrl.push(StockDetailsPage, {
          stock: stock,
          alert: alert,
          usdeur: usdeur
    });
  }
  
  

  public usd2eur(value){
    return cognitionis.toFixed2(value*this.usdeur);
  }
  public eur2usd(value){
    return cognitionis.toFixed2(value/this.usdeur);
  }
  public portfdiff(portf,market,value){
    if(portf){
        if(cognitionis.usd_market(market)){
            return (parseFloat(this.usd2eur(value))-portf)/portf;
        }else{
            return (value-portf)/portf;
        }
    }else{
        return;
    }
  }
  
  public outdated(stock){
    stock.last_financials_year = 0;
    var max_dist=1;
    var curr_month=(new Date()).getMonth()+1;
    var curr_year=(new Date()).getFullYear();
    if(stock.hasOwnProperty('revenue_hist') && typeof(stock.revenue_hist)!='undefined' && stock.revenue_hist.length>0){
        //console.log(stock.name+" "+stock.revenue_hist.length);
        stock.last_financials_year = parseFloat((stock.revenue_hist[((stock.revenue_hist.length) - 1)][0]).substr(0,4));
        if(curr_month<3){
            max_dist=2;
        }
        if((curr_year-stock.last_financials_year)>max_dist){
            return true;
        }
    }

    return false;
  }
  
  public cheap(market, guess){
      if(parseFloat(market)<parseFloat(guess)*0.90) return true;
      return false;
  }
  public expensive(market, guess){
      if(parseFloat(market)>parseFloat(guess)*1.8) return true;
      return false;
  }
  public mkt_guess_ratio(market,guess){
    return ((parseFloat(market)/parseFloat(guess)).toFixed(1));
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

  reorder_ypr_hec(ev: any){
    if(this.orderByField!='-value_hist_last_diff' && this.orderByField!='-computable_val_growth' && this.orderByField!='-h_souce +range_52week_heat' && this.orderByField!='-om_to_ps' && this.orderByField!='+guessed_percentage' && this.orderByField!='+leverage_industry_ratio' && this.orderByField!='-mktcap' && this.orderByField!='-inst_own' ){
        this.reverseSort='-';
        this.orderByField = '-h_souce +range_52week_heat';
//      original -avgyield_per_ratio +range_52week_heat
//    }else if(this.orderByField=='-avgyield_per_ratio +range_52week_heat'){
//        this.reverseSort='-';
//        this.orderByField = '-h_souce';
    }else if(this.orderByField.split(' ')[0]=='-h_souce'){
        this.reverseSort='-';
        this.orderByField = '-value_hist_last_diff';
    }else if(this.orderByField.split(' ')[0]=='-value_hist_last_diff'){
        this.reverseSort='-';
        this.orderByField = '-computable_val_growth';
    }else if(this.orderByField.split(' ')[0]=='-computable_val_growth'){
        this.reverseSort='+';
        this.orderByField = '+guessed_percentage';
    }else if(this.orderByField.split(' ')[0]=='+guessed_percentage'){
        this.reverseSort='-';
        this.orderByField = '-om_to_ps';
    }else if(this.orderByField.split(' ')[0]=='-om_to_ps'){
        this.reverseSort='+';
        this.orderByField = '+leverage_industry_ratio';
//    }else if(this.orderByField.split(' ')[0]=='+price_to_sales'){
//        this.reverseSort='+';
//        this.orderByField = '+leverage_industry_ratio';
    }else if(this.orderByField.split(' ')[0]=='+leverage_industry_ratio'){
        this.reverseSort='-';
        this.orderByField = '-mktcap';
    }else{
        console.log('d');
        this.reverseSort='-';
        this.orderByField = '-avg_revenue_growth_5y';
    }
  }

  reorder_per_eps(ev: any){
    if(this.orderByField!='-epsp'){
        this.reverseSort='-';
        this.orderByField = this.reverseSort+'epsp';
    }else{
        this.reverseSort='-';
        this.orderByField = this.reverseSort+'prod';
    }/*else{
        this.reverseSort='-';
        this.orderByField = this.reverseSort+'eps_hist_last_diff';
    }*/
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
    //console.log('getItems() start');
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;
    console.log('searching: '+val);

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.stocks = this.stocks.filter((item) => {
        return ((item.name+item.market).toLowerCase().indexOf(val.toLowerCase()) > -1 || (item.title && (item.title).toLowerCase().indexOf(val.toLowerCase()) > -1)  );
      });
    }
  }
  
  showAlerted(){
    // Reset items back to all of the items
    this.initializeItems();
    if(this.alert_filter_on){
        //this.orderByField = '-avgyield_per_ratio +range_52week_heat'; original
        this.orderByField = '-h_souce +range_52week_heat';
        this.reverseSort = '-';
        this.alert_filter_on=false;
        return;
    }
    this.orderByField='none';this.reverseSort='';
    this.alert_filter_on=true;
    if(!this.alerts){this.stocks=[];return;}
    
    let alertedp = this.stocks.filter((item) => {
        if(this.alerts.hasOwnProperty(item.name+":"+item.market))
            return (this.alerts[item.name+":"+item.market].active && this.alerts[item.name+":"+item.market].portf);
        return false;
    });
    let alerted = this.stocks.filter((item) => {
        if(this.alerts.hasOwnProperty(item.name+":"+item.market))
            return (this.alerts[item.name+":"+item.market].active && !this.alerts[item.name+":"+item.market].portf);
        return false;
    });
    alerted=alertedp.concat(alerted);
    
    let not_alertedp=this.stocks.filter((item) => {
        if(this.alerts.hasOwnProperty(item.name+":"+item.market))
            return (!this.alerts[item.name+":"+item.market].active && this.alerts[item.name+":"+item.market].portf);
        return false;
    });
    let not_alerted=this.stocks.filter((item) => {
        if(this.alerts.hasOwnProperty(item.name+":"+item.market))
            return (!this.alerts[item.name+":"+item.market].active && !this.alerts[item.name+":"+item.market].portf);
        return false;
    });
    not_alerted=not_alertedp.concat(not_alerted);

    this.stocks=alerted.concat(not_alerted);
  }

  
}

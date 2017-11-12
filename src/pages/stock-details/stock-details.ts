import { Component } from '@angular/core';
import { AngularFire } from 'angularfire2'; //FirebaseListObservable, FirebaseObjectObservable
//import firebase from 'firebase'

import { MyFireAuth } from '../../providers/myfireauth';
import {cognitionis} from '../../lib/cognitionis.ts';
import { NavController, NavParams } from 'ionic-angular';
//import { ProgressBarComponent } from '../../components/progress-bar/progress-bar';

@Component({
  selector: 'page-stock-details',
  templateUrl: 'stock-details.html'
})
export class StockDetailsPage {
  stock: any;
  alert: any;
  usdeur: any;
  alert_status: any= {};
  encuser: string = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public af: AngularFire, public myfireauth: MyFireAuth) {
    // If we navigated to this page, we will have an item available as a nav param
    this.stock = navParams.get('stock');
    // partial calculations ypr
    this.stock.calc_om=1;
    this.stock.calc_ps=1;
    this.stock.calc_om_ps=1;
    this.stock.calc_lev_score=1;
    this.alert = navParams.get('alert');
    this.usdeur = navParams.get('usdeur');
    if(typeof(this.alert)=='undefined') this.alert={};
    this.check_alert_detailed();
  }
  ngOnInit(){
    if(this.myfireauth.user){
        this.encuser=cognitionis.encodeAFemail(this.myfireauth.user.email);
        console.log(this.encuser);
    }
  }
  public toFixed2(value) {
    return parseFloat(value).toFixed(2);
  }
  public mult100(value) {
    return (parseFloat(value)*100).toFixed(0);
  }
  public usd2eur(value){
    return this.toFixed2(value*this.usdeur);
  }
  public eur2usd(value){
    return this.toFixed2(value/this.usdeur);
  }
  public usd_market(value){
    if(value=="NASDAQ" || value=="NYSE"){return true;}
    else{return false;}
  }
  public portfdiff(){
    if(this.alert.portf){
        if(this.usd_market(this.stock.market)){
            return (parseFloat(this.usd2eur(this.stock.value))-this.alert.portf)/this.alert.portf;
        }else{
            return (this.stock.value-this.alert.portf)/this.alert.portf;
        }
    }else{
        return;
    }
  }

  public loss_percentage(val,percentage){
    if(typeof(percentage)=='undefined') percentage=0.2;
    return parseFloat(val)*(1-percentage);
  }
  
  public loss_percentage_portf(){
        if(this.usd_market(this.stock.market)){
            return this.loss_percentage(parseFloat(this.eur2usd(this.alert.portf)),0.2);
        }else{
            return this.loss_percentage(parseFloat(this.alert.portf),0.2);
        }
  }
  
  
  public update_alert(field,restriction){
      console.log(JSON.stringify(this.alert));
      if(typeof(restriction)=='undefined') restriction='';
      //alert('alerts/'+this.encuser+'/'+this.stock.name+':'+this.stock.market+'/'+field+"    "+this.alert[field]);
      if(!this.alert[field] || this.alert[field]==''){
        if(!this.alert.hasOwnProperty(field)) return;
        delete this.alert[field];
        if(cognitionis.objectLength(this.alert)==1){
            console.log('delete alert completely');
            this.af.database.object('alerts/'+this.encuser+'/'+this.stock.name+':'+this.stock.market).remove();
        }else{
            delete this.alert.active;
            this.af.database.object('alerts/'+this.encuser+'/'+this.stock.name+':'+this.stock.market).set(this.alert);
        }
      }else{
        if(restriction.indexOf('num')!=-1){
            if(!cognitionis.isNumber(this.alert[field])){
                alert('ERROR: '+field+' must be a number');
                return;
            }else{
                this.alert[field]=parseFloat(this.alert[field]).toFixed(2);
            }
        }
        if(restriction=='-num' && parseFloat(this.alert[field])>=0){
            alert('ERROR: '+field+' must be negative');
            return;
        }else if (restriction=='+num' && parseFloat(this.alert[field])<=0){
            alert('ERROR: '+field+' must be positive');
            return;        
        }
        if(!this.alert.hasOwnProperty('symbol')){
            this.alert.symbol=this.stock.name+':'+this.stock.market;
            this.af.database.object('alerts/'+this.encuser+'/'+this.stock.name+':'+this.stock.market+'/symbol').set(this.alert.symbol);
            console.log('new alert created');
        }
        this.af.database.object('alerts/'+this.encuser+'/'+this.stock.name+':'+this.stock.market+'/'+field).set(this.alert[field]);
      }
      this.check_alert_detailed();
  }
  
  check_alert_detailed(){
    this.alert_status={};
    if(this.alert.low && parseFloat(this.alert.low)>=parseFloat(this.stock.value)){
        //console.log('low');
        this.alert_status.low=true;
    }else{
        delete this.alert_status.low;
    }
    if(this.alert.high && parseFloat(this.alert.high)<=parseFloat(this.stock.value)){
        //console.log('high');
        this.alert_status.high=true;
    }else{
        delete this.alert_status.high;
    }

    if(this.alert.lowe && parseFloat(this.alert.lowe)>=parseFloat(this.usd2eur(this.stock.value))){
        this.alert_status.lowe=true;
    }else{
        delete this.alert_status.lowe;
    }
    if(this.alert.highe && parseFloat(this.alert.highe)<=parseFloat(this.usd2eur(this.stock.value))){
        this.alert_status.highe=true;
    }else{
        delete this.alert_status.highe;
    }

    if(this.alert.low_change_percentage && parseFloat(this.alert.low_change_percentage)>=parseFloat(this.stock.session_change_percentage)){
        console.log('lowc');
        this.alert_status.low_change_percentage=true;
    }else{
        delete this.alert_status.low_change_percentage;
    }
    if(this.alert.high_change_percentage && parseFloat(this.alert.high_change_percentage)<=parseFloat(this.stock.session_change_percentage)){
        console.log('highc');
        this.alert_status.high_change_percentage=true;
    }else{
        delete this.alert_status.high_change_percentage;
    }
    
    if(this.alert.low_yield && parseFloat(this.alert.low_yield)>=parseFloat(this.stock.yield)){
        this.alert_status.low_yield=true;
    }else{
        delete this.alert_status.low_yield;
    }
    if(this.alert.high_yield && parseFloat(this.alert.high_yield)<=parseFloat(this.stock.yield)){
        this.alert_status.high_yield=true;
    }else{
        delete this.alert_status.high_yield;
    }
    
    if(this.alert.low_per && parseFloat(this.alert.low_per)>=parseFloat(this.stock.per)){
        this.alert_status.low_per=true;
    }else{
        delete this.alert_status.low_per;
    }
    if(this.alert.high_per && parseFloat(this.alert.high_per)<=parseFloat(this.stock.per)){
        this.alert_status.high_per=true;
    }else{
        delete this.alert_status.high_per;
    }
    
    if(this.alert.low_eps && parseFloat(this.alert.low_eps)>=parseFloat(this.stock.eps)){
        this.alert_status.low_eps=true;
    }else{
        delete this.alert_status.low_eps;
    }
    if(this.alert.high_eps && parseFloat(this.alert.high_eps)<=parseFloat(this.stock.eps)){
        this.alert_status.high_eps=true;
    }else{
        delete this.alert_status.high_eps;
    }
    
    if(this.alert.low_eps && (parseFloat(this.alert.portf)*0.8)>=parseFloat(this.stock.value)){
        this.alert_status.portf=true;
    }else{
        delete this.alert_status.portf;
    }
    // no high

  }
  
}

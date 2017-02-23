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
  encuser: string = null;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public af: AngularFire, public myfireauth: MyFireAuth) {
    // If we navigated to this page, we will have an item available as a nav param
    this.stock = navParams.get('stock');
    this.alert = navParams.get('alert');
    if(typeof(this.alert)=='undefined') this.alert={};
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
        }
        this.af.database.object('alerts/'+this.encuser+'/'+this.stock.name+':'+this.stock.market+'/'+field).set(this.alert[field]);
      }
  }
  
}

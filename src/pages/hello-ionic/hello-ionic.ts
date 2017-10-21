import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, Platform } from 'ionic-angular';
import { AngularFire } from 'angularfire2'; //FirebaseListObservable
//import {GooglePlus} from 'ionic-native';
//import firebase from 'firebase'

import { MyFireAuth } from '../../providers/myfireauth';
//import {cognitionis} from '../../lib/cognitionis.ts';

import { StocksPage } from '../stocks/stocks';
//import { ProvatablePage } from '../provatable/provatable';
//import { AlertsPage } from '../alerts/alerts';

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})
export class HelloIonicPage {
    show_login: boolean=false;

    constructor(public navCtrl: NavController, public alertCtrl: AlertController,
                public af: AngularFire, public actionSheetCtrl: ActionSheetController, private platform: Platform,public myfireauth: MyFireAuth) {
    }

    ngOnInit(){
        this.af.auth.subscribe(user => {
                if(user) {
                    this.navCtrl.setRoot(StocksPage);
                }else {
                    console.log('fire user logged out'); 
                    this.show_login=true; // now we can really show the button because it won't disappear
                    //this.user = null;
                    // go to login page is already this one... understand navigation...
                    //this.navCtrl.setRoot(HelloIonicPage);
                }
        });
    }
    open_page(){
          //this.navCtrl.push(StocksPage);
          this.navCtrl.setRoot(StocksPage);
    }

}

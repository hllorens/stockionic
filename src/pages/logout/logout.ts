import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, Platform } from 'ionic-angular';
import { AngularFire } from 'angularfire2'; //FirebaseListObservable


import { MyFireAuth } from '../../providers/myfireauth';


//import { StocksPage } from '../stocks/stocks';


@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html'
})
export class LogoutPage {
    constructor(public navCtrl: NavController, public alertCtrl: AlertController,
                public af: AngularFire, public actionSheetCtrl: ActionSheetController, private platform: Platform,public myfireauth: MyFireAuth) {
}

ngOnInit(){
        this.myfireauth.logout();
        /*this.af.auth.subscribe(user => {
                if(user) {
                    this.navCtrl.setRoot(StocksPage);
                }else {
                    this.navCtrl.setRoot(HelloIonicPage);*/

}

}

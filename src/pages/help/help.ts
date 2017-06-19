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
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {
    constructor(public navCtrl: NavController, public alertCtrl: AlertController,
                public af: AngularFire, public actionSheetCtrl: ActionSheetController, private platform: Platform,public myfireauth: MyFireAuth) {
    }

    ngOnInit(){

    }


}

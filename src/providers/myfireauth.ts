import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import {GooglePlus} from 'ionic-native';
import firebase from 'firebase'
import {cognitionis} from '../lib/cognitionis.ts';

@Injectable()
export class MyFireAuth {
  user: any = null;
  constructor(public af: AngularFire, public alertCtrl: AlertController) {
        // suscription equivalent to onAuthStateChanged
        this.af.auth.subscribe(user => {
                if(user) {
                    //alert('fire user logged in:'+user.auth.email);
                    this.user = user.auth;
                }else {
                    //alert('fire user logged out');
                    this.user = null;
                }
        });
  }
  
  displayAlert(value,title)
  {
      let coolAlert = this.alertCtrl.create({
      title: title,
      message: JSON.stringify(value),
      buttons: [
                    {
                        text: "Ok"
                    }
               ]
      });
      coolAlert.present();
    }

    login()
    {
    console.log('login');
    if(cognitionis.is_local()){
        GooglePlus.login({
          'webClientId': '718126583517-dsh4gj37l8hihqrpeilrlo6jehsj51lf.apps.googleusercontent.com',
          'offline': true
        }).then((obj) => {
            if (!firebase.auth().currentUser) {
                firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.idToken))
                .then((success) => {
                    console.log(JSON.stringify(success),"signInWithCredential successful");
                })
                .catch((gplusErr) => {
                    this.displayAlert(JSON.stringify(gplusErr),"GooglePlus failed")
                });
            }
        }).catch( (msg) => {
          this.displayAlert(msg,"Gplus signin failed2")
        });
    }else{
        this.af.auth.login();
    } 
    }
    logout() {
        console.log('logout');
        if(!cognitionis.is_local()){
            this.af.auth.logout();
        }else{
            GooglePlus.logout().then(
                (msg) => {
                      alert('logout ok');
                      if(firebase.auth().currentUser){
                        firebase.auth().signOut();
                      }
                }).catch(
                (msg) => {
                    alert('logout error: '+msg);
                })
            ;
        }
    }
}

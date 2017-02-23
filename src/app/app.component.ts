import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen, Toast } from 'ionic-native';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { LogoutPage } from '../pages/logout/logout';
//import { StocksPage } from '../pages/stocks/stocks';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage: any = HelloIonicPage;
  pages: Array<{title: string, component: any}>;
  backPressed: boolean = false;
  unregisterCustomBackActionFunction: any = null;


  constructor(
    public platform: Platform,
    public menu: MenuController,
    public alertCtrl: AlertController
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      //{ title: 'Stocks', component: StocksPage },
      { title: 'Logout', component: LogoutPage },
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      
      // non angular way: document.addEventListener('backbutton', () => {})
      // then with  this.unregisterCustomBackActionFunction(); you can restore the default
      // parameters: callback (a function), priority (a number higher priority will execute first)
      this.unregisterCustomBackActionFunction = this.platform.registerBackButtonAction(() => {
        // simplest but bad UX user is trapped (seems you cannot exit)
        //this.nav.setRoot(StocksPage);
            this.menu.close();
            if (this.nav.canGoBack()) {
              this.nav.pop()
              return;
            }
            if(!this.backPressed) {
              this.backPressed = true
              //window.plugins.toast.show cordova native with plugin
              /*Toast.show('click back again to exit', '2000', 'top').subscribe(
                  toast => {
                    console.log(toast);
                  }
                );*/
              //alert('');
              this.confirmExitApp();
              setTimeout(() => this.backPressed = false, 2000)
              return;
            }
            this.platform.exitApp() // navigator.app.exitApp() angular native
        }, 0); //101
            
      


    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
  confirmExitApp() {
        let confirm = this.alertCtrl.create({
        title: 'Confirm Exit',
        message: 'Really exit app?',
        buttons: [
        {
        text: 'Cancel',
        handler: () => {
        console.log('Disagree clicked');
        }
        },
        {
        text: 'Exit',
        handler: () => {
        this.platform.exitApp()
        }
        }
        ]
        });
        confirm.present();
  }


}

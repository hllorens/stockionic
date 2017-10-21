import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native'; //, Toast

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { LogoutPage } from '../pages/logout/logout';
import { HelpPage } from '../pages/help/help';
import { ExtraPage } from '../pages/extra/extra';
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
      { title: 'Extra', component: ExtraPage },
      { title: 'Help', component: HelpPage },
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
      // with  this.unregisterCustomBackActionFunction(); you can restore the default
      // parameters: callback (a function), priority (a number higher priority will execute first)
      this.unregisterCustomBackActionFunction = this.platform.registerBackButtonAction(() => {
        // simplest but bad UX user is trapped (seems you cannot exit)
        //this.nav.setRoot(StocksPage);
            this.menu.close();
            if (this.nav.canGoBack()) {
              this.nav.pop()
              return;
            }
            /*if(!this.backPressed) {
              //this.backPressed = true
              //window.plugins.toast.show cordova native with plugin
              Toast.show('click back again to exit', '2000', 'top').subscribe(
                  toast => {
                    console.log(toast);
                  }
                );
              //alert('');
              this.confirmExitApp();
              //setTimeout(() => this.backPressed = false, 2000)
              //return;
            }
            this.platform.exitApp() // navigator.app.exitApp() angular native
            */
            this.confirmExitApp();
        }, 0); //101
            
      


    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    if(page.component.name=='LogoutPage'){ this.nav.setRoot(page.component);}
    else{ this.nav.push(page.component);}
  }
  confirmExitApp() {
        // avoid opening multiple
        if(this.backPressed) return;
        else this.backPressed = true;
        let confirm = this.alertCtrl.create({
        title: 'Confirm Exit',
        message: 'Really exit app?',
        buttons: [
        {
            text: 'Cancel',
            handler: () => {
            this.backPressed=false;
            console.log('Cancelled');
            }
        },
        {
            text: 'Minimize',
            handler: () => {
            this.backPressed=false;
            console.log('Minimize');
            window['plugins'].appMinimize.minimize();
            }
        },
        {
            text: 'Exit',
            handler: () => {
            this.backPressed=false;
            this.platform.exitApp()
            }
        }
        ]
        });
        confirm.present();
  }


}

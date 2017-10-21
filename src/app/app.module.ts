import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { LogoutPage } from '../pages/logout/logout';
import { HelpPage } from '../pages/help/help';
import { ExtraPage } from '../pages/extra/extra';
import { StockDetailsPage } from '../pages/stock-details/stock-details';
import { StocksPage } from '../pages/stocks/stocks';


import { OrderBy } from '../pipes/orderby';
import { CognitionisStocks } from '../providers/cognitionis-stocks';


import { ProgressBarComponent } from '../components/progress-bar/progress-bar';

import { MyFireAuth } from '../providers/myfireauth';
// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, firebaseAuthConfig} from "../environments/firebase.config";

@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    HelpPage,
    ExtraPage,
    StockDetailsPage,
    StocksPage,
    LogoutPage,
    OrderBy,
    ProgressBarComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    HelpPage,
    ExtraPage,
    StockDetailsPage,
    LogoutPage,
    StocksPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},MyFireAuth,CognitionisStocks] //,CognitionisAlerts
})
export class AppModule {}

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Stock } from '../models/stock';

/*
  Generated class for the CognitionisStocks provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CognitionisStocks {
  cognitionisUrl = 'http://cognitionis.000webhostapp.com/cult/www/backend/get_stock.php';
  //cognitionisUrl = 'http://cognitionis.atwebpages.com/cult/www/backend/get_stock.php'; works CORS and cron-job.org but cannot acces external servers (curl/email)
  constructor(public http: Http) {
    console.log('Hello CognitionisStocks Provider');
  }
  load(): Observable<Stock[]> {
    return this.http.get(`${this.cognitionisUrl}`)
      .map(res => <Stock[]>res.json());
  }
}

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
  cognitionisUrl = 'http://www.cognitionis.com/cult/www/backend/get_stock.php';
  constructor(public http: Http) {
    console.log('Hello CognitionisStocks Provider');
  }
  load(): Observable<Stock[]> {
    return this.http.get(`${this.cognitionisUrl}`)
      .map(res => <Stock[]>res.json());
  }

}

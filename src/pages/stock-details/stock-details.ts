import { Component, ChangeDetectorRef } from '@angular/core';
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
  usdeur: any;
  tsv_arr: any;
  tsv_arr_keys: any;
  alert_status: any= {};
  encuser: string = null;
  cognitionis:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public af: AngularFire, public myfireauth: MyFireAuth, public cd: ChangeDetectorRef) {
    this.cognitionis=cognitionis;
    // If we navigated to this page, we will have an item available as a nav param
    this.stock = navParams.get('stock');
    this.stock.mktcap = parseFloat(this.stock.mktcap);
    this.stock.revenue = 0;
    this.stock.last_financials_year = "0000";
    this.stock.last_financials_outdated = true;
    if(this.stock.hasOwnProperty('revenue_hist') && this.stock.revenue_hist.length>0){
        this.stock.revenue = parseFloat(this.stock.revenue_hist[(this.stock.revenue_hist.length -1 )][1]);
        this.stock.last_financials_year = (this.stock.revenue_hist[(this.stock.revenue_hist.length -1 )][0]).substr(0,4);
        var max_dist=1;
        var curr_month=(new Date()).getMonth()+1;
        var curr_year=(new Date()).getFullYear();
        if(curr_month<3){
            max_dist=2;
        }
        if((curr_year-parseFloat(this.stock.last_financials_year))<=max_dist){
            this.stock.last_financials_outdated=false;
        }
    }
        
    // partial calculations ypr
    this.stock.calc_om_ps=cognitionis.toFixed2(Math.max(Math.min((parseFloat(this.stock.operating_margin)*300)/Math.max((parseFloat(this.stock.price_to_sales)*10),0.1),1),-1));
    this.stock.calc_lev_ind_ratio=cognitionis.toFixed2(Math.max(Math.min(parseFloat(this.stock.leverage_industry_ratio),2),1));
    this.stock.calc_yield=0;
    this.stock.calc_computable_yield=Math.min(parseFloat(this.stock.avgyield),parseFloat(this.stock.yield))/100;
    if(this.stock.calc_computable_yield>0.029 && this.stock.calc_computable_yield<=parseFloat(this.stock.epsp)){ // if it's a big (>3%) healthy viable yield (<=epsp)
        this.stock.calc_yield=Math.min(0.30+((this.stock.calc_computable_yield-0.029)*25),1.0); // max 1 (if y>6)
    }
    this.stock.calc_val_growth=0;
    this.stock.calc_computable_val_growth=((Math.max(Math.min(parseFloat(this.stock.val_change_5y),20),-20)+
                                            Math.max(Math.min(parseFloat(this.stock.val_change_5yp),20),-20)+
                                            Math.max(Math.min(parseFloat(this.stock.val_change_3y),20),-20)+
                                            Math.max(Math.min(parseFloat(this.stock.val_change_3yp),20),-20)+
                                            Math.max(Math.min(parseFloat(this.stock.val_change_3ypp),20),-20))
                                            /5)
                                            /100;
    this.stock.calc_computable_val_growth_y=this.stock.calc_computable_val_growth+this.stock.calc_computable_yield;
    if(this.stock.calc_computable_val_growth_y>0){
        this.stock.calc_val_growth=Math.min(this.stock.calc_computable_val_growth_y*5,1);
    }
    this.stock.calc_type={
        name: "Regular",
        weight_yield: 0,
        weight_val_growth: 2,
        weight_rev_growth: 3,
        weight_epsp: 3,
        weight_leverage: 1,
        weight_val_growth_penalty: 2,
        weight_rev_growth_penalty: 2,
        weight_eps_growth_penalty: 2
    }
    
    this.stock.calc_rev_growth=0;
    if(parseFloat(this.stock.revenue_growth)>0){
        this.stock.calc_rev_growth=parseFloat(this.stock.revenue_growth)*2; // *3 to make it reach max 1
		if(parseFloat(this.stock.revenue_growth)>0.01) this.stock.calc_rev_growth+=0.1;
		if(parseFloat(this.stock.revenue_growth)>0.03) this.stock.calc_rev_growth+=0.1;
		if(parseFloat(this.stock.revenue_growth)>0.05) this.stock.calc_rev_growth+=0.1;
		if(parseFloat(this.stock.revenue_growth)>0.06) this.stock.calc_rev_growth+=0.1;
		if(parseFloat(this.stock.revenue_growth)>0.10) this.stock.calc_rev_growth+=0.1;
    }
    //this.stock.calc_rev_growth+=this.stock.calc_om_ps*0.3; // max around 0.3 (can be penalizing -0.1)
    // good quarter only +0.1 (cannot penalize), and only if om/ps>0.2
    if(parseFloat(this.stock.revenue_growth_qq_last_year)>0){ // && this.stock.calc_om_ps>0.2
        this.stock.calc_rev_growth+=Math.min(parseFloat(this.stock.revenue_growth_qq_last_year),10)/100;
    }
	if(this.stock.revenue_growth_trend=="/"){ // the good healthy revenue growth pattern
		this.stock.calc_rev_growth+=0.1;
		if(this.stock.revenue_acceleration>0){
			this.stock.calc_rev_growth+=0.1; // expansive bonus
		}
	}
    this.stock.calc_rev_growth=Math.max(Math.min(this.stock.calc_rev_growth,1),0);  // min 0 max 1
    
    
    this.stock.calc_epsp=0;
    if(this.stock.prod>=0){
        // DEPRECATED the distribution of positive cases goes from 0 to 10% (avg 4.5, 6.67==per15, and good enough for 100% score)
        this.stock.calc_epsp=(parseFloat(this.stock.prod))*7;
        if(this.stock.calc_computable_yield>(parseFloat(this.stock.calc_epsp)+0.006)) this.stock.calc_epsp-=(parseFloat(this.stock.calc_epsp)-this.stock.calc_computable_yield)*15; // penalized if yield > $epsp
        if(this.stock.prod_ps_trend=='v') this.stock.calc_epsp+=0.05; 
        if(this.stock.prod_ps_trend=='_/') this.stock.calc_epsp+=0.08; 
        if(this.stock.prod_ps_trend=='/') this.stock.calc_epsp+=0.10;
        this.stock.calc_epsp=Math.max(Math.min(this.stock.calc_epsp,1),0);  // min 0 max 1
    }

    
    
    this.stock.calc_leverage=(-1*this.stock.calc_lev_ind_ratio)+2;
    this.stock.eq=0.001;
    if(this.stock.equity_hist && this.stock.equity_hist.length>0)
        this.stock.eq=parseFloat(this.stock.equity_hist[(this.stock.equity_hist.length -1 )][1]);
    this.stock.calc_eqps= (this.stock.eq/parseFloat(this.stock.shares));
    this.stock.calc_eqp= this.stock.calc_eqps/parseFloat(this.stock.value);
    this.stock.calc_pb= parseFloat(this.stock.value)/this.stock.calc_eqps;
	this.stock.calc_pb_inv=cognitionis.toFixed2(1/Math.max(0.0001,parseFloat(this.stock.price_to_book)));
    this.stock.assets=parseFloat(this.stock.leverage)*this.stock.eq;
    this.stock.calc_aps= (this.stock.assets/parseFloat(this.stock.shares));
    this.stock.calc_ap= this.stock.calc_aps/parseFloat(this.stock.value);
    this.stock.calc_lps= ((this.stock.assets-this.stock.eq)/parseFloat(this.stock.shares));
    this.stock.calc_lp= this.stock.calc_lps/parseFloat(this.stock.value);
    
    
    this.stock.calc_yield_w=this.stock.calc_yield*this.stock.calc_type.weight_yield;
    this.stock.calc_val_growth_w=this.stock.calc_val_growth*this.stock.calc_type.weight_val_growth;
                

    this.stock.calc_rev_growth_w=this.stock.calc_rev_growth*this.stock.calc_type.weight_rev_growth;
    this.stock.calc_epsp_w=this.stock.calc_epsp*this.stock.calc_type.weight_epsp;
    this.stock.calc_leverage_w=this.stock.calc_leverage*this.stock.calc_type.weight_leverage;

	this.stock.score_eqp=1;
	// buffet pb=1.5 -> 0.66, avg pb=4 --> 0.20
	if(this.stock.eqp<=0.66){this.stock.score_eqp=0.9;}  // buffet acceptance
	if(this.stock.eqp<=0.5){this.stock.score_eqp=0.8;}
	if(this.stock.eqp<=0.4){this.stock.score_eqp=0.7;}
	if(this.stock.eqp<=0.3){this.stock.score_eqp=0.6;}
	if(this.stock.eqp<=0.2){this.stock.score_eqp=0.5;}  // average
	if(this.stock.eqp<=0.15){this.stock.score_eqp=0.3;}
	if(this.stock.eqp<=0.10){this.stock.score_eqp=0;}


	this.stock.calc_guessp=0;
	if(this.stock.guessed_percentage<0.7) this.stock.calc_guessp+=0.5;
	if(this.stock.guessed_percentage<0.9) this.stock.calc_guessp+=0.5;
	if(this.stock.guessed_percentage>1.7) this.stock.calc_guessp-=0.5;
	if(this.stock.guessed_percentage>2.7) this.stock.calc_guessp-=0.5;
	
    this.stock.calc_val_growth_penalty=0;
    if(this.stock.calc_computable_val_growth<0){
        this.stock.calc_val_growth_penalty=this.stock.calc_computable_val_growth*5;
    }
    if(parseFloat(this.stock.val_yy_drops)>0.3) this.stock.calc_val_growth_penalty-=0.15;
    if(parseFloat(this.stock.val_yy_drops)>0.67) this.stock.calc_val_growth_penalty-=0.25;
    this.stock.calc_val_growth_penalty=Math.max(Math.min(this.stock.calc_val_growth_penalty,0),-1);
    this.stock.calc_val_growth_penalty_w=this.stock.calc_val_growth_penalty*this.stock.calc_type.weight_val_growth_penalty; 

    this.stock.calc_rev_growth_penalty=0.0;
	if(parseFloat(this.stock.revenue_growth_qq_last_year)< 0){
		this.stock.calc_rev_growth_penalty+=Math.max(-0.1,parseFloat(this.stock.revenue_growth_qq_last_year)/100);
	}
    if(parseFloat(this.stock.avg_revenue_growth)<0){
        this.stock.calc_rev_growth_penalty+=parseFloat(this.stock.revenue_growth)*3;
    }
	if(this.stock.revenue_growth_trend!="/" && this.stock.revenue_growth_trend!="_/" && this.stock.revenue_growth_trend!="v" ){
		this.stock.calc_rev_growth_penalty+=-0.1;
	}
	if(this.stock.revenue_growth_trend=="\\" || this.stock.revenue_growth_trend=="-\\"){
		this.stock.calc_rev_growth_penalty+=-0.1;
	}

    this.stock.calc_rev_growth_penalty=Math.max(Math.min(this.stock.calc_rev_growth_penalty,0),-1);  // min 0 max 1
    this.stock.calc_rev_growth_penalty_w=this.stock.calc_rev_growth_penalty*this.stock.calc_type.weight_rev_growth_penalty; 

    
    this.stock.calc_eps_growth_penalty=0.0;
    //if(parseFloat(this.stock.epsp)<0.03){
        if(this.stock.prod_ps_trend=='\\') this.stock.calc_eps_growth_penalty=-0.5;
        if(this.stock.prod_ps_trend=='-\\') this.stock.calc_eps_growth_penalty=-0.25;
        if(this.stock.prod_ps_trend=='\_') this.stock.calc_eps_growth_penalty=-0.15;
        if(this.stock.prod_ps_trend=='^') this.stock.calc_eps_growth_penalty=-0.25;
    //}
    if(parseFloat(this.stock.epsp)<-0.015 || parseFloat(this.stock.operating_margin)<-0.015) this.stock.calc_eps_growth_penalty=-0.5;
    this.stock.calc_eps_growth_penalty_w=this.stock.calc_eps_growth_penalty*this.stock.calc_type.weight_eps_growth_penalty; 
	

	
	
	this.stock.calc_h_souce= (this.stock.calc_val_growth_w) +
						(this.stock.calc_rev_growth_w) +
						(this.stock.calc_epsp_w) +
						(this.stock.calc_leverage_w) +
						(this.stock.score_eqp) +
						(this.stock.calc_eps_growth_penalty_w) +
						(this.stock.calc_rev_growth_penalty_w) +
						(this.stock.calc_val_growth_penalty_w) +
						this.stock.calc_guessp;
	if(parseFloat(this.stock.current_ratio)<1){
		this.stock.calc_h_souce-=(1-parseFloat(this.stock.current_ratio));
	}

    this.stock.calc_value_sell_share_raw=((parseFloat(this.stock.revenue)/Math.max(0.0001,parseFloat(this.stock.shares)))).toFixed(1);
    this.stock.calc_value_sell_share=((parseFloat(this.stock.revenue)/Math.max(0.0001,parseFloat(this.stock.shares)))*Math.min((parseFloat(this.stock.operating_margin)*100)/33,1)).toFixed(1);
    // max 0.5 of the value... rest must be operating income and revG
    this.stock.calc_value_asset_share=Math.min(parseFloat(this.stock.value)/Math.max(0.0001,parseFloat(this.stock.price_to_book)),
                                               parseFloat(this.stock.value)*0.5).toFixed(1);
    this.stock.calc_value_mult_factor=                          ((
                            Math.max(Math.min(
                            Math.min(parseFloat(this.stock.avg_revenue_growth_5y),40)   // max 40
                            +(Math.min(parseFloat(this.stock.epsp),0.06)*400)           // max 24
                            ,60),1)   // max 60, min 1                
                          )/7).toFixed(1); // ideally 7.5 but accounting for optimism
    
    this.stock.calc_value=((parseFloat(this.stock.calc_value_sell_share)
                          *
                          parseFloat(this.stock.calc_value_mult_factor))
                          +parseFloat(this.stock.calc_value_asset_share)
                          ).toFixed(1);
    
    
    
    this.tsv_arr={};
    
	this.stock.om_max=parseFloat(this.stock.operating_margin);
	this.stock.om_avg=0;
    if(this.stock.name.substr(0,5)!='INDEX'){
        this.tsv_arr=cognitionis.get_anualized_data('value',this.stock,this.tsv_arr);
        this.tsv_arr=cognitionis.get_anualized_data('revenue',this.stock,this.tsv_arr);
        this.tsv_arr=cognitionis.get_anualized_data('operating_income',this.stock,this.tsv_arr);
        this.tsv_arr=cognitionis.get_anualized_data('net_income',this.stock,this.tsv_arr);
        this.tsv_arr=cognitionis.get_anualized_data('equity',this.stock,this.tsv_arr);
        var num_elems=0;
		var om=0;
		var ni=0;
		this.stock.om_manual_update=false;
		this.stock.om_manual_update_msg="";
        for (var year in this.tsv_arr) {
           if (this.tsv_arr.hasOwnProperty(year) && this.tsv_arr[year].revenue && this.tsv_arr[year].revenue>0) {
              //console.log(year);
              num_elems++;
              this.tsv_arr[year].om=parseFloat(cognitionis.toFixed2(parseFloat(this.tsv_arr[year].operating_income)/parseFloat(this.tsv_arr[year].revenue)));
              this.stock.om_avg+=parseFloat(cognitionis.toFixed2(parseFloat(this.tsv_arr[year].operating_income)/parseFloat(this.tsv_arr[year].revenue)));
              if(this.tsv_arr[year].om>this.stock.om_max) this.stock.om_max=this.tsv_arr[year].om;
			  om=this.tsv_arr[year].om;
			  ni=parseFloat(this.tsv_arr[year].net_income);
           }
        }
        this.stock.om_avg=parseFloat(cognitionis.toFixed2(this.stock.om_avg/num_elems));
        this.stock.om_avg_no_max=parseFloat(cognitionis.toFixed2((this.stock.om_avg-this.stock.om_max)/(num_elems-1)));
		this.stock.calc_om_pot=om;
		if(om>0.01 && om<this.stock.om_avg_no_max){
			this.stock.calc_om_pot=(this.stock.om_avg_no_max+om)/2;
		}
		if(this.stock.calc_om_pot<0.01 && this.stock.revenue_growth>0.25){
			this.stock.calc_om_pot=0.01;
		}
		
		if(om==0){
			this.stock.om_manual_update=true;
			if(ni!=0){
				this.stock.om_manual_update_msg="used<br />1.1ni";
			}
		}
		
        var prev_prod_ps = 0;
        for (var key in this.tsv_arr) {
           if (this.tsv_arr.hasOwnProperty(key) && this.tsv_arr[key].revenue && this.tsv_arr[key].revenue>0) {
              // get the last stuff
              /*this.stock.operating_income_ps=Math.max(parseFloat(this.tsv_arr[key].operating_income_ps),
                                                      parseFloat(this.tsv_arr[key].net_income_ps)+0.1*Math.abs(parseFloat(this.tsv_arr[key].net_income_ps)),
                                                      parseFloat(this.tsv_arr[key].revenue_ps)*this.stock.om_pot
                                                      );*/
              this.tsv_arr[key].prod_ps=Math.max(     parseFloat(this.tsv_arr[key].operating_income_ps),
                                                      parseFloat(this.tsv_arr[key].net_income_ps)+0.1*Math.abs(parseFloat(this.tsv_arr[key].net_income_ps))
													  //,
                                                      //parseFloat(this.tsv_arr[key].revenue_ps)*this.stock.om_pot
                                                      );
			    this.tsv_arr[key].prod_source='R';
			    if(this.tsv_arr[key].prod_ps==parseFloat(this.tsv_arr[key].operating_income_ps)) this.tsv_arr[key].prod_source='O';
			    if(this.tsv_arr[key].prod_ps==(parseFloat(this.tsv_arr[key].net_income_ps)+0.1*Math.abs(parseFloat(this.tsv_arr[key].net_income_ps)))){
				    this.tsv_arr[key].prod_source='N';
			    }
				
				this.tsv_arr[key].prod_ps_g = 0;
				if (prev_prod_ps != 0) {
					this.tsv_arr[key].prod_ps_g = cognitionis.compound_average_growth(prev_prod_ps,this.tsv_arr[key].prod_ps);
				}
				prev_prod_ps=this.tsv_arr[key].prod_ps;
			  
              this.tsv_arr[key].prod_psp=cognitionis.toFixed(this.tsv_arr[key].prod_ps / parseFloat(this.tsv_arr[key].value),3);

              this.stock.revenue_ps=parseFloat(this.tsv_arr[key].revenue_ps);
              this.stock.revenue_psp=parseFloat(this.tsv_arr[key].revenue_psp);
              this.stock.equity_ps=parseFloat(this.tsv_arr[key].equity_ps);
              this.stock.last_value=parseFloat(this.tsv_arr[key].value);
              // guess value for every year
              this.tsv_arr[key].guess1=  ( Math.min(this.tsv_arr[key].equity_ps,this.tsv_arr[key].value/2) +
                                            (
                                                (3*this.tsv_arr[key].operating_income_ps) *
                                                ((
                                                    Math.max(Math.min(
                                                    Math.min(parseFloat(this.tsv_arr[key].revenue_g)*100,40)   // max 40
                                                    +(Math.min(parseFloat(this.tsv_arr[key].net_income_psp),0.06)*400)           // max 24
                                                    /*+(Math.min(Math.max(parseFloat(this.tsv_arr[key].net_income_psp)*1.1,
                                                                        parseFloat(this.tsv_arr[key].operating_income_psp),
                                                                        parseFloat(this.tsv_arr[key].revenue_psp)*this.stock.om_pot
                                                                        
                                                                        ),0.10)*400)*/           // max 24
                                                    ,60),1)   // max 60, min 1                
                                                )/7)
                                            )
                                          ).toFixed(1);
              this.tsv_arr[key].guess5=  (  Math.min(this.tsv_arr[key].equity_ps,this.tsv_arr[key].value/2) + 
                                             //this.tsv_arr[key].operating_income_ps + // this is to count something the current year
                                            (
                                               5*cognitionis.compound_interest_4(
                                                                                    this.tsv_arr[key].prod_ps
                                                                                    ,
                                                                                  Math.min(parseFloat(this.tsv_arr[key].revenue_g)+
                                                                                           Math.max(-0.1,Math.min(0.1,parseFloat(this.tsv_arr[key].revenue_a)/2))
                                                                                           ,0.50) // %50 sustained growth in 5 years is a reasonable max (more might be impossible)
                                                                                   ,5) // in 5 y we don't limit the revenue_g
                                            )
                                          ).toFixed(1);
              this.tsv_arr[key].guess10=  ( Math.min(this.tsv_arr[key].equity_ps,this.tsv_arr[key].value/2) +
                                             //this.tsv_arr[key].operating_income_ps + // this is to count something the current year
                                            (
                                               10*cognitionis.compound_interest_4(this.tsv_arr[key].prod_ps,
                                                                                  Math.min(parseFloat(this.tsv_arr[key].revenue_g)+
                                                                                           Math.max(-0.1,Math.min(0.1,parseFloat(this.tsv_arr[key].revenue_a)/2))
                                                                                           ,0.30) // %30 sustained growth in 10 years is a reasonable max (although some might beat it)
                                                                                           ,10)
                                            )
                                          ).toFixed(1);
           }
        }
        //console.log('tsv_arr '+JSON.stringify(this.tsv_arr));
        this.tsv_arr_keys=[];
        for (var key2 in this.tsv_arr) {
            if (this.tsv_arr.hasOwnProperty(key2) && key2[0]=='2') {
                //console.log(key2);
                this.tsv_arr_keys.push(key2);
            }
        }
        //console.log(this.tsv_arr_keys);
        this.stock.guess_5y=Math.min(this.stock.equity_ps,this.stock.value/2) +
                            5*cognitionis.compound_interest_4(this.stock.prod_ps,
                                                                Math.min(
                                                              parseFloat(this.stock.revenue_growth)+
                                                               Math.max(-0.1,Math.min(0.1,parseFloat(this.stock.revenue_acceleration)/2))
                                                               ,0.60)
                                                               ,5)
							- (this.stock.calc_lps/4); // subtract what we would pay in debt in 5y assuming payup current in 20y
        this.stock.guess_10y=Math.min(this.stock.equity_ps,this.stock.value/2) +
                             10*cognitionis.compound_interest_4(this.stock.prod_ps,
                                                                Math.min(
                                                               parseFloat(this.stock.revenue_growth)+
                                                               Math.max(-0.1,Math.min(0.1,parseFloat(this.stock.revenue_acceleration)/2))
                                                               ,0.30)
                                                               ,10);
        //this.stock.guess_5_10_avg=cognitionis.toFixed(((this.stock.guess_5y+this.stock.guess_10y)/2),1);
        //this.stock.guess_5_10_avg_and_eq=cognitionis.toFixed(this.stock.guess_5_10_avg+this.stock.calc_value_asset_share,1);
    }
    
    
    
    this.alert = navParams.get('alert');
    this.usdeur = navParams.get('usdeur');
    if(typeof(this.alert)=='undefined') this.alert={};
    this.check_alert_detailed();
  }
  ngOnInit(){
    if(this.myfireauth.user){
        this.encuser=cognitionis.encodeAFemail(this.myfireauth.user.email);
        console.log(this.encuser);
    }
  }
  public usd2eur(value){
    return cognitionis.toFixed2(value*this.usdeur);
  }
  public eur2usd(value){
    return cognitionis.toFixed2(value/this.usdeur);
  }
  public portfdiff(){
    if(this.alert.portf){
        if(cognitionis.usd_market(this.stock.market)){
            return (parseFloat(this.usd2eur(this.stock.value))-this.alert.portf)/this.alert.portf;
        }else{
            return (this.stock.value-this.alert.portf)/this.alert.portf;
        }
    }else{
        return;
    }
  }

  public loss_percentage(val,percentage){
    if(typeof(percentage)=='undefined') percentage=0.2;
    if(cognitionis.usd_market(this.stock.market)) return (parseFloat(val)*(1-percentage));
    return (parseFloat(val)*(1-percentage));
  }
  
  public loss_percentage_portf(){
        if(cognitionis.usd_market(this.stock.market)){
            return this.loss_percentage(parseFloat(this.eur2usd(this.alert.portf)),0.2);
        }else{
            return this.loss_percentage(parseFloat(this.alert.portf),0.2);
        }
  }
  
  public show_stop_val(){
      var x=parseFloat(this.stock.value);
      if(cognitionis.usd_market(this.stock.market)) x=parseFloat(this.usd2eur(x));
      return this.alert.portf<x;
  }
  
  public stopdiff(){
    if (this.show_stop_val()){
        if(this.alert.portf){
            if(cognitionis.usd_market(this.stock.market)){
                return (((parseFloat(this.usd2eur(this.stock.value))*0.8-this.alert.portf)/this.alert.portf)*100).toFixed(0);
            }else{
                return (((this.stock.value*0.8-this.alert.portf)/this.alert.portf)*100).toFixed(0);
            }
        }else{
            return;
        }
    }else{
        return "-20";
    }
  }
  
  public diff_percentage(arr,i){
      //console.log(i+"hola"+arr[i]);
      var divisor=parseFloat(arr[i-1][1]);
      if(divisor==0){divisor=0.1;}
      return parseInt((((parseFloat(arr[i][1])-parseFloat(arr[i-1][1]))/divisor)*100).toFixed(0));
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
            delete this.alert.active;
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
            console.log('new alert created');
        }
        this.af.database.object('alerts/'+this.encuser+'/'+this.stock.name+':'+this.stock.market+'/'+field).set(this.alert[field]);
      }
      this.check_alert_detailed();
  }
  
  check_alert_detailed(){
    this.alert_status={};
    if(this.alert.low && parseFloat(this.alert.low)>=parseFloat(this.stock.value)){
        //console.log('low');
        this.alert_status.low=true;
    }else{
        delete this.alert_status.low;
    }
    if(this.alert.high && parseFloat(this.alert.high)<=parseFloat(this.stock.value)){
        //console.log('high');
        this.alert_status.high=true;
    }else{
        delete this.alert_status.high;
    }

    if(this.alert.lowe && parseFloat(this.alert.lowe)>=parseFloat(this.usd2eur(this.stock.value))){
        this.alert_status.lowe=true;
    }else{
        delete this.alert_status.lowe;
    }
    if(this.alert.highe && parseFloat(this.alert.highe)<=parseFloat(this.usd2eur(this.stock.value))){
        this.alert_status.highe=true;
    }else{
        delete this.alert_status.highe;
    }

    if(this.alert.low_change_percentage && parseFloat(this.alert.low_change_percentage)>=parseFloat(this.stock.session_change_percentage)){
        console.log('lowc');
        this.alert_status.low_change_percentage=true;
    }else{
        delete this.alert_status.low_change_percentage;
    }
    if(this.alert.high_change_percentage && parseFloat(this.alert.high_change_percentage)<=parseFloat(this.stock.session_change_percentage)){
        console.log('highc');
        this.alert_status.high_change_percentage=true;
    }else{
        delete this.alert_status.high_change_percentage;
    }
    
    if(this.alert.low_yield && parseFloat(this.alert.low_yield)>=parseFloat(this.stock.yield)){
        this.alert_status.low_yield=true;
    }else{
        delete this.alert_status.low_yield;
    }
    if(this.alert.high_yield && parseFloat(this.alert.high_yield)<=parseFloat(this.stock.yield)){
        this.alert_status.high_yield=true;
    }else{
        delete this.alert_status.high_yield;
    }
    
    if(this.alert.low_per && parseFloat(this.alert.low_per)>=parseFloat(this.stock.per)){
        this.alert_status.low_per=true;
    }else{
        delete this.alert_status.low_per;
    }
    if(this.alert.high_per && parseFloat(this.alert.high_per)<=parseFloat(this.stock.per)){
        this.alert_status.high_per=true;
    }else{
        delete this.alert_status.high_per;
    }
    
    if(this.alert.low_eps && parseFloat(this.alert.low_eps)>=parseFloat(this.stock.eps)){
        this.alert_status.low_eps=true;
    }else{
        delete this.alert_status.low_eps;
    }
    if(this.alert.high_eps && parseFloat(this.alert.high_eps)<=parseFloat(this.stock.eps)){
        this.alert_status.high_eps=true;
    }else{
        delete this.alert_status.high_eps;
    }
    
    if(this.alert.low_eps && (parseFloat(this.alert.portf)*0.8)>=parseFloat(this.stock.value)){
        this.alert_status.portf=true;
    }else{
        delete this.alert_status.portf;
    }
    // no high
	
	 console.log(JSON.stringify(this.alert_status));
	// force refresh
	  let activeView = this.navCtrl.getActive();
	  if (activeView.component == StockDetailsPage) {   //if(this.navCtrl.getActive().name === 'StocksPage')
		console.log('detecting changes details');
		this.cd.detectChanges(); // this fixes the issue, triggers change detection
		// seems to not work in Android??? perhaps add some badge... to see
	  }
  }
  
}

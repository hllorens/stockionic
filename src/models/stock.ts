export interface Stock {
	name: string;
	market: string;
	title: string;
	value: string;
	session_change_percentage: string;
    range_52week_low: string;
    range_52week_high: string;
    range_52week_heat: string;
    range_52week_volatility: string;
	yield: string;
    epsp: string;
	avgyield: string;
    h_souce: string;
    price_to_book: string;
    
  // THIS IS INDEED NEEDED, CAN WE JUST GET RID OF THE CLASS ITSELF?
  // YES WE CAN IF WE DEFINE IT LIKE "ANY", DO THIS NORMALLY TO AVOID CLUTTER...
  usdeur: string;
  /*usdeur_change: string;
  usdeur_hist:  any[];
  usdeur_hist_last_diff: string;
  usdeur_hist_trend: string;
  avgusdeur: string;

  btcusd: string;
  btcusd_change: string;
  btcusd_hist:  any[];
  btcusd_hist_last_diff: string;
  btcusd_hist_trend: string;
  avgbtcusd: string;*/
}

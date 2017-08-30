export interface Stock {
	name: string;
	market: string;
	title: string;
	value: string;
	session_change: string;
	session_change_percentage: string;
    range_52week: string;
    range_52week_low: string;
    range_52week_high: string;
    range_52week_heat: string;
    range_52week_volatility: string;
	yield: string;
	avgyield: string;
	yield_per_ratio: string;
	avgyield_per_ratio: string;
	dividend: string;
	divs_per_year: string;
	dividend_total_year: string;
	beta: string;
	eps: string;
	eps_hist: any[];
	eps_hist_last_diff: string;
    eps_hist_trend: string;
	per: string;
	roe: string;
    usdeur: string;
}

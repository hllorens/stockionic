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
	yield_per_ratio: string;
	dividend: string;
	divs_per_year: string;
	dividend_total_year: string;
	beta: string;
	eps: string;
	eps_history: any[];
	per: string;
	roe: string;
}

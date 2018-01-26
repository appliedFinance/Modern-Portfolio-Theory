



// API Get: from www.bankrate.com
// Get this week's risk free rate (1y T-Bill)
function getRiskFreeRate(portfolio) {
	let rate = 0.0;
	const TBILLURL = "https://www.bankrate.com/rates/interest-rates/1-year-treasury-rate.aspx";
	let query =	$.get(TBILLURL);
	query.done( page => {
		let line1 = page.split(/ctl00_well_uc_rw1YearTRate_lbl1YearTRate/);
		rate = line1[1].match(/(\d\.\d+)/)[1];	
		portfolio.setRiskFreeRate(rate);
	});
	//fail silently letting Rf stay set at zero
}

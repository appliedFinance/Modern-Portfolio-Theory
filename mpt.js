// Modern Portfolio Theory

function say(s) { console.log(s); }

function pause(ms) { return new Promise(resolve=>setTimeout(resolve,ms));}

let NUM_ASSETS_WAITING=0;

async function doPortfolioCalculations(portfolio) {

	// Spin while waiting
	while (portfolio.numberAssets < NUM_ASSETS_WAITING) {
		await pause(500);
		say("waiting... " + portfolio.numberAssets + " -- " + NUM_ASSETS_WAITING);
		if (!portfolio.usable) {
			say("BREAK on 404");
			break;
		}
	}
	NUM_ASSETS_WAITING= 0; // clear the block

	if (portfolio.usable==true) {
		// GET this week's Risk Free rate (Rf)
		getRiskFreeRate(portfolio);
		while(!portfolio.Rf_set) { 
			await pause(200);
		}
		say("Risk Free Rate = " + portfolio.Rf);
		// Do the math next
		solveForTangentPortfolioWeights(portfolio);
	




	} else {
		//report 404

	}


}//doPortfolioCalculations

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

////////////////////////////////////////////////////////
// Object Definition:  PORTFOLIO OBJECT
function Portfolio() {
	// Fields
	this.assets = { 'ticker': [], 'perc': [], 'weight': [], 'Er': [], 'vol': [] };
	this.portEr = 0.0;
	this.portVol = 0.0;
	this.numberAssets = 0;
	this.DAYS = 252;
	this.usable = true;
	this.Rf = 0.0;
	this.Rf_set = false;
	// Methods

	// Clear the object for a new run
	this.clear = function myClear() { 
		this.numberAssets = 0;
		this.usable = true;
	}

	// Insert ticker data and change percentages
	this.addAsset = function myAddAsset(tkr,history) {
		this.assets.ticker[this.numberAssets] = tkr;
		say("Adding: ticker[" + this.numberAssets + "] = " + this.assets.ticker[this.numberAssets]);
		this.assets.perc[this.numberAssets] = new Array(this.DAYS);
		for(let i=0; i<history.length; i++)
		{
			this.assets.perc[this.numberAssets][i] = history[i].changePercent/100; //store as %
			//say(history[i].changePercent);
			//say("perc["+this.numberAssets+"]["+i+"] = " + this.assets.perc[this.numberAssets][i]);
		}
		// (+) if (this.DAYS == this.assets.perc.length) check.
		this.numberAssets++;
	}

	// Insert this week's risk free rate
	this.setRiskFreeRate = function mySetRiskFreeRate(rate) {
		this.Rf = rate;
		this.Rf_set = true;
	}
	this.getRf = function myGetRf() { return this.Rf; }

	// Insert the nth ticker's weight (%)
	this.setWeight = function mySetWeight(n,w) {
		this.weigth[n] = w;
	}

	// Check if the sum of all weights equal 100%
	this.checkWeights = function myCheckWeights() {
		let wSum = this.weights.reduce( (t,s) => t+s );
		if (wSum == 100) {
			return true;
		} else {
			return false;
		}
	}


	//////////////////////////////////////////////////
	// Helper Function to inspect state of this object
	this.reportAsset = function myReportAsset(n) {
		// (+) add out-of-bounds check
		console.log("=== " + this.assets.ticker[n] + " is loaded ===");
	}

	this.reportCurrentAsset = function myReportAsset() {
		console.log("=== " + this.assets.ticker[this.numberAssets-1] + " is loaded ===");
	}

	this.reportPortfolio = function myReportPortfolio() {
		let s = "";
		for(let i=0; i<this.numberAssets; i++) {
			s = s + this.assets.ticker[i] + "\t   ";
		}
		say(s);
		for(let m=1; m<this.DAYS; m++) {
			let t = "";
			for(let n=0; n<this.numberAssets; n++) {
				t = t + this.assets.perc[n][m] + "\t";
			}
			say(t);
		}
	}

}//Portfolio
////////////////////////////////////////////////////////////



//  API:  Historical Stock Data from iextrading.com
// Get the Historical Stock data by looping through the user's list
function fetcher(tkrlist, myPortfolio) {
	for (let i=0; i<tkrlist.length; i++) 
	{
		getDataFromAPI(tkrlist[i], myPortfolio);
	}
}

// Move the data from the returned object into our main object
function insertIntoPortfolio(data, tkr, portfolio) {
	portfolio.addAsset(tkr,data);
	//portfolio.reportCurrentAsset();	
	//portfolio.reportPortfolio();
}

function getDataFromAPI( tkr, portfolio ) {

	// build the parameters object
	let API_URL = `https://api.iextrading.com/1.0/stock/${tkr}/chart/1y`; 
		const settings = {
			'url': API_URL,
			'data': "",
			'dataType': 'json',
			'type': 'GET'
		};
	
	let query =	$.ajax(settings);
	query.done( data => insertIntoPortfolio(data, tkr, portfolio) );
	query.fail( data => { portfolio.usable = false; 
						       say("XXX '" + tkr + "' is 404 XXX") } );

}//getDataFromAPI


//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//   WEB PAGE CONTROLS
//
function watcher() {
	const myPortfolio = new Portfolio();  // Our Portfolio of stocks

	$('.js-search-form').on("submit", event => {
		event.preventDefault();
		console.clear();
		myPortfolio.clear();

		//let rawTickerList = $(event.currentTarget).find('.js-query').val();
		let rawTickerList = "GE C MSFT GOOG AAPL";
//		let rawTickerList = "mhk ea c";
		//let rawTickerList = "ALL CAT DE LOW NKE QRVO TAP WHR ALLE CB DFS FE HST LRCX NLSN R TDC WLTW ALXN CBG DG FFIV HSY LUK NOC TDG WM AMAT CBOE DGX FIS HUM LUV NOV RCL TEL";
		let tkrlist = rawTickerList.split(/[ ,]+/);
		NUM_ASSETS_WAITING = tkrlist.length;  // set up the watch-and-wait
		fetcher(tkrlist, myPortfolio); // the array of tickers and the portfolio object
		doPortfolioCalculations(myPortfolio);
	});

}

$(watcher);

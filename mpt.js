// Modern Portfolio Theory

function say(s) { console.log(s); }

function pause(ms) { return new Promise(resolve=>setTimeout(resolve,ms));}

let NUM_ASSETS_WAITING=0;

async function doPortfolioCalculations(port) {

	// Spin while waiting
	while (port.numberAssets < NUM_ASSETS_WAITING) {
		await pause(500);
		say("waiting... " + port.numberAssets + " -- " + NUM_ASSETS_WAITING);
		if (!port.usable) {
			say("BREAK on 404");
			break;
		}
	}
	NUM_ASSETS_WAITING= 0; // clear the block

	if (port.usable==true) {

		say("LET's ROCK!");
		const Rf = getRiskFreeRate();


	} else {
		//report 404

	}


}//doPortfolioCalculations


function getRiskFreeRate() {
	const TBILLURL = "https://www.bankrate.com/rates/interest-rates/1-year-treasury-rate.aspx";

	let page = $.get(TBILLURL);
	say( JSON.stringify(page) );
			
}


// Object Definition
function Portfolio() {
	// Fields
	this.assets = { 'ticker': [], 'perc': [] };
	this.numberAssets = 0;
	this.DAYS = 252;
	this.usable = true;
	// Methods

	this.clear = function myClear() { 
		this.numberAssets = 0;
		this.usable = true;
	}

	this.addAsset = function myAddAsset(tkr,history) {
		this.assets.ticker[this.numberAssets] = tkr;
		say("Adding: ticker[" + this.numberAssets + "] = " + this.assets.ticker[this.numberAssets]);
		this.assets.perc[this.numberAssets] = new Array(this.DAYS);
		for(let i=1; i<history.length; i++)
		{
			this.assets.perc[this.numberAssets][i] = history[i].changePercent;
			//say(history[i].changePercent);
			//say("perc["+this.numberAssets+"]["+i+"] = " + this.assets.perc[this.numberAssets][i]);
		}
		// (+) if (this.DAYS == this.assets.perc.length) check.
		this.numberAssets++;
	}


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


function watcher() {
	const myPortfolio = new Portfolio();  // Our Portfolio of stocks

	$('.js-search-form').on("submit", event => {
		event.preventDefault();
		console.clear();
		myPortfolio.clear();

		//let rawTickerList = $(event.currentTarget).find('.js-query').val();
	//	let rawTickerList = "GE C MSFT GOOG AAPL";
		let rawTickerList = "mhk ea jec goog xlnx ftv oke rrc avb orcl avgo mkc jnj shw udr dvn cme zbh jci glw";
		let tkrlist = rawTickerList.split(/[ ,]+/);
		NUM_ASSETS_WAITING = tkrlist.length;  // set up the watch-and-wait

		fetcher(tkrlist, myPortfolio); // the array of tickers and the portfolio object

		doPortfolioCalculations(myPortfolio);
	});


}

$(watcher);

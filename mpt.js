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



// API:  Historical Stock Data from iextrading.com
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
//   WEB PAGE CONTROLS
function watcher() {
	const myPortfolio = new Portfolio();  // Our Portfolio of stocks

	$('.js-search-form').on("submit", event => {
		event.preventDefault();
		console.clear();
		myPortfolio.clear();

		let rawTickerList = $(event.currentTarget).find('.js-query').val();
		//let rawTickerList = "GE C MSFT GOOG AAPL";
		
		// Some basic error checking of the input line:
		let tkrlist = rawTickerList.split(/[ ,]+/);
		tkrlist = tkrlist.filter(Boolean) // remove newlines & spaces
		tkrlist = Array.from(new Set(tkrlist)); // remove duplicates

		NUM_ASSETS_WAITING = tkrlist.length;  // set up the watch-and-wait
		fetcher(tkrlist, myPortfolio); // sent the array of tickers and the portfolio object
		doPortfolioCalculations(myPortfolio);
	});

	// Landing Pad
	$('.js-directions').html(APP_DIRECTIONS);
	$('.js-directions').on("click", function(event) {
		$(this).addClass('no-display');
	});


}

$(watcher);

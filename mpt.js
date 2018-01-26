// Modern Portfolio Theory

function say(s) { console.log(s); }

function pause(ms) { return new Promise(resolve=>setTimeout(resolve,ms));}

let NUM_ASSETS_WAITING=0;

function renderErrors(portfolio) {
	toggleSpinner();
	say("=== 404 === 404 ===");
	let s= "<p>The following ticker symbols did not return any data.  Please modifiy your portfolio input and try again.</p><p>";
	for(let i=0; i<portfolio.errors.length; i++) {
		say(portfolio.errors[i]);
		s += '<span class="error-spacer">' + portfolio.errors[i] + "</span>";
	}
	s += "</p>";
	s += '<p>Do you want me to Re-Submit after automatically removing these problems?</p><form action="#" class="js-re-submit"><button type="submit" id="re-send">RESUBMIT</button></form>';
	$('.js-results').html(s);
	say("===================");

}

function renderResults(portfolio) {
	toggleSpinner();
	let s="";
	// First output the portfolio as a whole
	//s = `<table class="width-80 margin-auto">
	s = `<table align="center">
		<caption>The Tangency Portfolio's 'Expected Return' and 'Volatility'</caption>
		<tr><th>Sharpe Ratio</th><th>E[r]</th><th>Volatility</th></tr>
		<tr>
		<td>${portfolio.sharpeRatio} ( R<sub>f</sub> =  <a href="https://www.bankrate.com/rates/interest-rates/1-year-treasury-rate.aspx" target="_blank"> ${portfolio.Rf}</a> )</td>
		<td>${portfolio.portEr}</td>
		<td>${portfolio.portVol}</td>
		</tr>
		</table>
		<br><br>
		`;

	// Now ouput the optimal weights
	s += `<div class="left-box">
				<table>
				<tr>
					<th class="center">STOCK</th>
				</tr>
		  `;	
	for(let i=0; i<portfolio.numberAssets; i++)
	{
		s += `
			<tr>
				<td class="center">${i+1}</td>
			</tr>
			  `;
	}
	s += `</table></div>`; 
	
	s += `<div class="right-box">
				<table>
					<caption>Your Weights</caption>
					<tr>
						<th class="center">Ticker</th>
						<th>Optimal</th>
					</tr>
		 `;	
	for(let i=0; i<portfolio.numberAssets; i++)
	{
		s += `
			<tr>
			<td><a class="ticker-box" href="#">${portfolio.assets.ticker[i].toUpperCase()}</a></td>
			<td class="ticker-box">${portfolio.assets.weight[i]}</td>
			</tr>
			`;
	}
	s += `</table></div>`;

	$('.js-results').html(s);
}//renderResults



async function doPortfolioCalculations(portfolio) {

	// Spin while waiting
	while ((portfolio.numberAssets + portfolio.numErrors) < NUM_ASSETS_WAITING)
	{
		await pause(1000);
		say("waiting... " + portfolio.numberAssets + " -- " + NUM_ASSETS_WAITING);
		//if (!portfolio.usable) {
		//	say("BREAK on 404");
		//	break;
		//}
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
		renderResults(portfolio);	
	} else {
		//report 404's
		renderErrors(portfolio);
	}

}//doPortfolioCalculations


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



//////////////////////////////////////////////////////////////
//   WEB PAGE CONTROLS

function toggleSpinner() {
	$('.spinner').toggleClass('hidden');
	$('.formdiv').toggleClass('hidden');
}

function watcher() {
	const myPortfolio = new Portfolio();  // Our Portfolio of stocks
	let tkrlist = [];
	$('.js-query').val("IBM GOOG C GE MSFT SPY INTC ");

	// Fetch Buton Click
	$('#js-search-form').on("submit", event => {
		event.preventDefault();
		console.clear();
		myPortfolio.clear();
		$('.js-results').html("");
		toggleSpinner();

		rawTickerList = $(event.currentTarget).find('.js-query').val();
		//let rawTickerList = "GE C MSFT GOOG AAPL";

		// Some basic error checking of the input line:
		tkrlist = rawTickerList.split(/[ ,]+/);
		tkrlist = tkrlist.filter(Boolean) // remove newlines & spaces
			// filter out non-letter. /\w{1,5}/
			// string.match(/\w{1,5}/);
			tkrlist = Array.from(new Set(tkrlist)); // remove duplicates

		NUM_ASSETS_WAITING = tkrlist.length;  // set up the watch-and-wait
		fetcher(tkrlist, myPortfolio); // sent the array of tickers and the portfolio object
		doPortfolioCalculations(myPortfolio);
	});

	// ReSubmit Button click
	$('.js-results').on("submit", ".js-re-submit", function(event) {
		say("RE-SUBMIT");
		toggleSpinner();
		$('.js-results').html("");
		tkrlist = tkrlist.filter( function(elt) {
			return !myPortfolio.errors.includes(elt);
		});
		$('.js-query').val(tkrlist);	
		say(tkrlist);
		myPortfolio.clear();
		NUM_ASSETS_WAITING = tkrlist.length;  // set up the watch-and-wait
		say("NEW num assets = " + NUM_ASSETS_WAITING);
		fetcher(tkrlist, myPortfolio); // sent the array of tickers and the portfolio object
		doPortfolioCalculations(myPortfolio);
	});

	// Landing Pad - App Directions 
	$('.js-directions').html(APP_DIRECTIONS);
	$(".intro-button-text").focus();
//	$('.js-directions').on("click", function(event) {
//		$(this).addClass('hidden');
//		$('div.formdiv').removeClass('hidden');
//	});
	$('.js-directions').on("submit", function(event) {
		$(this).addClass('hidden');
		$('div.formdiv').removeClass('hidden');
	});

	// Cancel Button on Spinner
	$('#js-spinner-form').on("submit", function (event) {
		toggleSpinner();
	});

	// Ticker Light Box
	$('.js-results').on("click", "a", function (event) {
		const myTicker = $(event.currentTarget).text();
		displayTickerCompanyStats(myTicker);
	});
	
	// Close lightbox
	$('.company-data').on("click", function(event) {
		$('.company-data').toggleClass('hidden');
	});

}//watcher

$(watcher);

/*
 *  o  Don't make the intro text clickable.
 *  o  don't show search box after fetch
 *  o  but add a 'resubmit'
 *  o  fix ReSubmit text/layout
 *  o  friendlier instructions
 *
 *
 */

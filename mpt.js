// Modern Portfolio Theory

function say(s) { console.log(s); }

function pause(ms) { return new Promise(resolve=>setTimeout(resolve,ms));}

let NUM_ASSETS_WAITING=0;

function renderErrors(portfolio) {

	$('.spinner').toggleClass('hidden');
	$('.formdiv').toggleClass('hidden');
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
	$('.spinner').toggleClass('hidden');
	$('.formdiv').toggleClass('hidden');
	let s="";
	// First output the portfolio as a whole
	s = `<table class="width-80 margin-auto">
		<caption>Tangency Portfolio</caption>
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
					<caption>Weights</caption>
					<tr>
						<th class="center">Ticker</th>
							<th>Optimal</th>
					</tr>
		 `;	
	for(let i=0; i<portfolio.numberAssets; i++)
	{
		s += `
			<tr>
			<td>${portfolio.assets.ticker[i].toUpperCase()}</td>
			<td>${portfolio.assets.weight[i]}</td>
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

// API:  GET http://ws.nasdaqdod.com/v1/NASDAQAnalytics.asmx/GetEndOfDayData?
//           Symbols=string&StartDate=string&EndDate=string&MarketCenters=string
function getEODfromAPI(tkr)
{
	// build the parameters object
	let API_URL = `http://ws.nasdaqdod.com/v1/NASDAQAnalytics.asmx/GetEndOfDayData`;
	const s = {
		'Symbols': tkr,
		'StartDate': ""
	};
	const settings = {
		'url': API_URL,
		'data': s,
		'dataType': 'json',
		'type': 'GET'
	};

	let query =	$.ajax(settings);
	query.done( data => say(data) );
	query.fail( data => say(data) ); 
}


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
		portfolio.numErrors++;
		portfolio.errors.push(tkr);
		say("XXX '" + tkr + "' is 404 XXX") } );

}//getDataFromAPI


//////////////////////////////////////////////////////////////
//   WEB PAGE CONTROLS
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
		$('.spinner').toggleClass('hidden');
		$('.formdiv').toggleClass('hidden');

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
		$('.spinner').toggleClass('hidden');
		$('.formdiv').toggleClass('hidden');
		$('.js-results').html("");
		//		$('.spinner').toggleClass('hidden');
		//		$('.formdiv').toggleClass('hidden');
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
	$('.js-directions').on("click", function(event) {
		$(this).addClass('hidden');
		$('div.formdiv').removeClass('hidden');
	});
	$('.js-directions').on("submit", function(event) {
		$(this).addClass('hidden');
		$('div.formdiv').removeClass('hidden');
	});

	// Cancel Button on Spinner
	$('#js-spinner-form').on("submit", function (event) {
		$('.spinner').toggleClass('hidden');
		$('.formdiv').toggleClass('hidden');
	});

}//watcher

$(watcher);


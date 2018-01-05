// Modern Portfolio Theory

function say(s) { console.log(s); }

function pause(ms) { return new Promise(resolve=>setTimeout(resolve,ms));}

function doPortfolioCalculations(port) {

	say("port.length = " + port.numberAssets );







}//calcPort



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
		this.numberAssets++;
	}

	this.reportAsset = function myReportAsset(n) {
		console.log("=== " + this.assets.ticker[n] + " ===");
		//for(let i=1; i<this.DAYS; i++) {console.log(this.assets.perc[n][i]);}
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

	doPortfolioCalculations(myPortfolio);
}

// Move the data from the returned object into our main object
function insertIntoPortfolio(data, tkr, port) {
	//say(tkr);
	port.addAsset(tkr,data);
	//	say("assets++ ->   " + port.numberAssets);
	port.reportPortfolio(port.numberAssets-1);	
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
	//say("***** " + `${tkr}` +"\n" + JSON.stringify(settings) + "\n*****");

	let query =	$.ajax(settings);
	query.done( data => insertIntoPortfolio(data, tkr, portfolio) );
	query.fail( data => { portfolio.usable = false; 
		say("XXX '" + tkr + "' is 404 XXX") } );

}//getDataFromAPI


function watcher() {
	const myPortfolio = new Portfolio();  // Our Portfolio of stocks

	$('.js-search-form').on("submit", event => {
		event.preventDefault();
		myPortfolio.clear();
		//let tkrlist = $(event.currentTarget).find('.js-query').val();
		let tkrlist = "GE C MSFT GOOG AAPL";
		fetcher(tkrlist.split(/[ ,]+/), myPortfolio);
	});


}

$(watcher);

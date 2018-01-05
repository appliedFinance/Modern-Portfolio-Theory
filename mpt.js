// Modern Portfolio Theory



function say(s) { console.log(s); }

// IEXTRADING_URL = "https://api.iextrading.com/1.0";


function translate(data, tkr, mo) {
	say(tkr);

}

function getDataFromAPI( tkr, mainObject ) {
	// build the parameters object
	let API_URL = `https://api.iextrading.com/1.0/stock/${tkr}/chart/1y`; 
	const settings = {
		'url': API_URL,
		'data': "",
		'dataType': 'json',
		'type': 'GET'
	};
	say("***** " + `${tkr}` +"\n" + JSON.stringify(settings) + "\n*****");
	let query =	$.ajax(settings);

	query.done( function(data) {translate(data, tkr, mainObject );} );
	query.fail( function(tkr) {
		say("XXX " + tkr + " XXX");
	});

}//getDataFromAPI










function watcher() {
	const port = {};

	$('.js-search-form').on("submit", event => {
		event.preventDefault();
		let tkr = $(event.currentTarget).find('.js-query').val();
		// API Call
		let tkrlist = ["GE","C","MSFT","GOOG","AAPL"];
		for (let i=0; i<tkrlist.length; i++) {
			//getDataFromAPI(tkr, displayResults);
			getDataFromAPI(tkrlist[i], port);
		}
	});
}

$(watcher);

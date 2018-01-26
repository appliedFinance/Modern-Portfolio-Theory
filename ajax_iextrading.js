
// API:  Historical Stock Data from iextrading.com


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


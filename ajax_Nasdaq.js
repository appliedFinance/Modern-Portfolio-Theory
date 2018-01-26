

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


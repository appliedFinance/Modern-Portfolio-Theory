// Modern Portfolio Theory



function say(s) { console.log(s); }

let IEXTRADING_URL = "https://api.iextrading.com/1.0";

function getDataFromAPI( tkr, callback ) {
	// build the parameters object
	let s = `/stock/${tkr}/chart/1y`; 
	IEXTRADING_URL += s;
	say("|||  " + s + "   |||");
	const settings = {
		'url': IEXTRADING_URL,
		'data': "",
		'dataType': 'json',
		'type': 'GET',
		'success': callback
	};
	say("*****\n" + settings + "*****\n\n");
	$.ajax(settings);
	//$.getJSON( URL, query, callback );
}

function displayResults(data) {
	say(data);
}


function watcher() {
	$('.js-search-form').on("submit", event => {
		event.preventDefault();
		let tkr = $(event.currentTarget).find('.js-query').val();
		// API Call
		getDataFromAPI(tkr, displayResults);
	});
}

$(watcher);

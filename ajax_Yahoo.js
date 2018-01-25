// $.get() finance.yahoo company info.

function say(s) { console.log(s); }

function getName(text) {
	let title = text.match('<title>(.*)?</title>')[1];
	let name = title.match('Summary for (.*)? -')[1];
	return name;
}

function getClose(text) {
	let line1 = text.split(/Previous Close/);
	let line2 = line1[1].split(/react-text/); 
	let close = line2[1].match('>(.*)?<')[1];
	return close;
}//getClose

function getRange(text) {
	let line1 = text.split(/Previous Close/);
	let line2 = line1[1].split(/react-text/); 
	let line3 = line2[4].split(/reactid/);
	let line4 = line3[12].match('>(.*)?</t')[1];		
	let range = line4.match(/(.*)\</)[1];
//	for(let i=0; i<line3.length; i++) 
//	{
//		say("\n\n****************************************************************************************************************************************************************************************************\n\n\n" + i + ": " + line3[i]);
//	}
	//return range;
}//getRange

function getBeta(text) {
	let line1 = text.split(/Previous Close/);
	let line2 = line1[1].split(/react-text/); 
//	for(let i=0; i<line2.length; i++) 
//	{
//		say("\n\n****************************************************************************************************************************************************************************************************\n\n\n" + i + ": " + line2[i]);
//	}
	let beta = line2[11].match('>(.*)?<')[1];
	return beta;
}//getBeta

async function displayTickerCompanyStats(ticker) {
	say("light -> " + ticker);

	const BASE = `https://finance.yahoo.com/quote/${ticker}?p=${ticker}`;
	say(BASE);
	const QUERY = 'http://www.whateverorigin.org/get?url=' + encodeURIComponent('https://finance.yahoo.com/quote/'+ticker+'?p='+ticker) + '&callback=?';

	let companyName = "--";
	let close = "--";
	let beta = "--";
	$.getJSON(QUERY, function(data) {
		companyName =  getName(data.contents) ;
		say("Name: " + companyName);
		close = getClose(data.contents);
		say("Close: " + close);
		//const range = getRange(data.contents);
		//say("Range: " + range);
		beta = getBeta(data.contents);
		say("Beta: " + beta);
	});

	// spin
	toggleSpinner();
	while (beta == "--") {
		await pause(500);
	}
	toggleSpinner();

	const s = `	<div class="company-frame">
					<p><span class="a-title">Name</span>: ${companyName}</p>
					<p><span class="a-title">Close</span>: ${close}</p>
					<p><span class="a-title">Beta</span>: ${beta}</p>
					</div>
					x click to close
				 `;
	$('.company-data').html(s);
	$('.company-data').toggleClass('hidden');

}//displayTickerCompanyStats

function what() {
	say("What?");
}

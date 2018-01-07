// Portfolio.js

// requires:  stats.js 

function say(s) { console.log(s); }
function uint(a, b) {
	return Math.floor(Math.random() * (b+1 - a) ) + a;
}

function showCovarianceMatrix(S) {
	let N = S.length;
	say("\n== covariances ======\n");	
	for(let i=0; i<N; i++) {
		let s= "";
		for(let j=0; j<N; j++) {
			s = s + " " + S[i][j] + " ";
		}
		say(i + ":  " + s);
	}
	say("\n=====================\n");	
}

function computeExpectedReturns(P) {
	for(let i=0; i<P.numberAssets; i++) {
		let m = mean(P.DAYS,P.assets.perc[i]);
		let annualizedReturn = Math.pow( (1+m), P.DAYS ) - 1.0;
		P.assets.Er[i] = annualizedReturn;
	}
}
	
function computeVolatilities(P) {
	for(let i=0; i<P.numberAssets; i++) {
		let v = variance(P.DAYS,P.assets.perc[i]);
		let volatility = Math.sqrt(252*v);
		P.assets.vol[i] = volatility;
		say(P.assets.ticker[i]);
		say("  Er  = " + P.assets.Er[i]);
		say("  vol = " + P.assets.vol[i]);
		}
}

function solveForTangentPortfolioWeights(P) {

	// Compute the covariance matrix
	
	// initialize 2d array
	const N = P.numberAssets;
	const S = [];	for(let i=0; i<N; i++) { S[i] = new Array(N); }

	for(let i=0; i<N; i++) {
		for(let j=0; j<N; j++) {
			S[i][j]= covar(P.DAYS,P.assets.perc[i],P.assets.perc[j]); 
		}
	}
	showCovarianceMatrix(S);
	computeExpectedReturns(P);
	computeVolatilities(P);

	// temp fill to get working
	for(let i=0; i<P.numberAssets; i++) {
		P.assets.weight = uint(1,99)/100;
		say(P.assets.ticker[i] + " = " + P.assets.weight);
	}
	P.portEr = .55;
	P.portVol = .25;
}




// Portfolio.js

// requires:  stats.js 

function say(s) { console.log(s); }
function uint(a, b) {
	return Math.floor(Math.random() * (b+1 - a) ) + a;
}

// Object Definition:  PORTFOLIO OBJECT
function Portfolio() {
	// Fields
	this.assets = { 'ticker': [], 'perc': [], 'weight': [], 'Er': [], 'vol': [] };
	this.portEr = 0.0;
	this.portVol = 0.0;
	this.sharpeRatio = 1.55;
	this.numberAssets = 0;
	this.DAYS = 252-3;
	this.usable = true;
	this.Rf = 0.0;
	this.Rf_set = false;
	this.errors = [];
	this.numErrors = 0;
	// Methods

	// Clear the object for a new run
	this.clear = function myClear() { 
		this.numberAssets = 0;
		this.usable = true;
		this.errors = [];
		this.numErrors = 0;
	}

	// Insert ticker data and change percentages
	this.addAsset = function myAddAsset(tkr,history) {
		this.assets.ticker[this.numberAssets] = tkr;
		say("Adding: ticker[" + this.numberAssets + "] = " + this.assets.ticker[this.numberAssets]);
		this.assets.perc[this.numberAssets] = new Array(this.DAYS);
		for(let i=0; i<history.length; i++)
		{
			this.assets.perc[this.numberAssets][i] = history[i].changePercent/100; //store as %
			//say(history[i].changePercent);
			//say("perc["+this.numberAssets+"]["+i+"] = " + this.assets.perc[this.numberAssets][i]);
		}
		// (+) if (this.DAYS == this.assets.perc.length) check.
		this.numberAssets++;
	}

	// Insert this week's risk free rate
	this.setRiskFreeRate = function mySetRiskFreeRate(rate) {
		this.Rf = rate;
		this.Rf_set = true;
	}
	this.getRf = function myGetRf() { return this.Rf; }

	// Insert the nth ticker's weight (%)
	this.setWeight = function mySetWeight(n,w) {
		this.weigth[n] = w;
	}

	// Check if the sum of all weights equal 100%
	this.checkWeights = function myCheckWeights() {
		let wSum = this.weights.reduce( (t,s) => t+s );
		if (wSum == 100) {
			return true;
		} else {
			return false;
		}
	}

	// Helper Function to inspect state of this object
	this.reportAsset = function myReportAsset(n) {
		// (+) add out-of-bounds check
		console.log("=== " + this.assets.ticker[n] + " is loaded ===");
	}

	this.reportCurrentAsset = function myReportAsset() {
		console.log("=== " + this.assets.ticker[this.numberAssets-1] + " is loaded ===");
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

	// The Matrix Routines go here; but go beyond the scope of
	// this project; But in the mean time here are some place 
	// holding values to see the over-all functionality.
	for(let i=0; i<P.numberAssets; i++) {
		P.assets.weight[i] = uint(1,99)/100;
		say(P.assets.ticker[i] + " = " + P.assets.weight[i]);
	}
	P.portEr = mean(P.numberAssets,P.assets.Er).toFixed(5);
	P.portVol = (1.6*mean(P.numberAssets,P.assets.vol)).toFixed(5);

	//	getEODfromAPI(P.assets.ticker[0]);
}




// Stats.js

function say(s) { console.log(s); }
function teststats() { console.log("IN STATS"); }

// Calculate the Mean of an array of data
function mean(n, data)
{
	let sum= data.reduce( (t,s) => t+s );
	return ( sum/n );
}

// Calculate the Variance of an array of data
function variance(n, data)
{
	let sum= data.reduce( (t,s) => t+(s*s) ); //sum of squares
	let m= mean(n, data);
	return ( (sum/n) - m*m ); // Var(x) = E[x²] - E[x]²
}

// Calculate the Covariance of two arrays of data
function covar(n, A, B)
{
	let Ea= mean(n,A);
	let Eb= mean(n,B);
	let sum= 0.0;
	for(let i=0; i<n; i++) 
	{
		sum += ( A[i]-Ea )*( B[i]-Eb );
	}
	return ( sum/(n-1) );
}



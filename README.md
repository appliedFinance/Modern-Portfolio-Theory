Tangecy Portfolio:
Compute the weights of the Tangency Portfolio given a list of stock tickers.

 VISIT THE PAGE =>  http://www.highbaycapital.com/mpt/mpt.html


API's used:
  - api.iextrading.com v1.0
  - www.bankrate.com html-scrape with a Get
  - finance.yahoo.com html-scape for summary statistics

Let the user input a list of ticker symbols. Then compute and output the
weights for each stock corresponding to the Tangential Portfolio 
(i.e. the portfolio having greatest Sharpe Ratio.)  Also, display interesting
summary data to help build a picture of the portfolio's content.


Example:
Tangential Portfolio	
STOCK   Ticker	Optimal	 Sharp Ratio	 Mean	      Volatility<br>
			  1.51		  0.259139564	0.131990748<br>
	1      AAPL    2%<br>				
	2      ETR     2%				
	3      HD      8%				
	4      LH      11%				
	5      MON     8%				
	6      NFLX    18%				
	7      RSG     14%				
	8      SPG     3%				
	9      T       21%				
	10     UPS     12%				
	sum check =   100%		


THE STORY:
=========
Byron was fresh out of high school and landed a great job with a hedge fund.
Douglas Day was the managing director; he was a high charisma smooth-talker.
And wouldn’t you know it just as Byron looked at his cell phone it started 
ringing, the Incoming Caller’s name glowed Douglas Day.

Byron’s eyes widened.  He took a deep breath and answered the phone.

“Byron speaking.”

“Byron.  It’s Douglas.  Listen I’m at the airport and just saw the news from
Australia.  Listen, go to someplace like yahoo finance and see who they list
as the most active stocks today.  This is what I want you to do.  Grab five
to ten tickers and using the 1 year T-Bills, text me the weights of your 
ticker's tangent portfolio.  I’m going to use your portfolio as my risky 
asset during my talk.  Something with companies in today’s headlines will 
go over well.  Got it?”

“Yes. I understand.”

“Great.  My plane takes off in 32 minutes.  Text me your weights before I 
take off.  Ok Byron, get to it.” 

Byron remembered using yahoo stock data in his portfolio management class.
He went to the webpage and quickly had eight tickers ready to use.   But wait, 
he only had 32 minutes.  Grabbing all eight of his choice's historical data 
and dumping them into an excel spread sheet would take precious time.  Then
he would have to actually look up excel formulas to make sure he got the 
parameters correct.  And he would have to google for the relevant matrix 
math because he hadn’t actually needed to use it since his class two 
semesters ago.  All this in a half-hour?  

Bryon began to sweat.  

“I know!” he said out loud.  “I’ll use the app Rande made for his Thinkul’s
asynchronous web app project.”

Rande used an API that returned historical stock data.  Plus he does actually 
get this week’s 1 year T-bills rate from bankrate.com using an ajax get, and 
parses the html for the current value.  Plus, he used another API returning
more general company data; using this provides more information about each 
ticker leading to an overview of the portfolio’s content.

After landing 12 hours later, Denise sent him a $300 gift card, along with a text, “Thanks for the quick work.”









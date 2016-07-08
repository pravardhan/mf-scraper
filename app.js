var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var baseUrl = 'http://www.moneycontrol.com';
var urls = {
    holdingsBase: baseUrl + '/india/mutualfunds/mfinfo/portfolio_holdings/',
    smallCap: baseUrl + '/mutual-funds/performance-tracker/returns/small-and-mid-cap-8.html',
    largeCap: baseUrl + '/mutual-funds/performance-tracker/returns/large-cap.html',
    diversified: baseUrl + '/mutual-funds/performance-tracker/returns/diversified-equity.html',
    elss: baseUrl + '/mutual-funds/performance-tracker/returns/elss.html'
};

app.get('/scrape/smallcap', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    request(urls.smallCap, function(error, response, html){
        if(!error){
            var allDetailsObject = {};
            var mfDetails = {}
            
            var $ = cheerio.load(html);
            var listOfUrlsToBeVisited = [];
            var $anchorTags = $("table.gry_t tr");
            $($anchorTags).each(function (index, $anchorTag) {
                if($($anchorTag).find("td").find("a").length == 0) {
                   return;
                }
                var mfType = "small";
                var mfName = $($anchorTag).find("td:first-child").find("a:first-child").html();
                var mfLink = baseUrl + $($anchorTag).find("td:first-child").find("a:first-child").attr("href");
                var crisilRank = $($anchorTag).find("td:nth-child(2)").find("a:first-child").html();
                var aum = $($anchorTag).find("td:nth-child(3)").html();
                var _1yearReturn = parseFloat($($anchorTag).find("td:nth-child(7)").html());
                var _2yearReturn = parseFloat($($anchorTag).find("td:nth-child(8)").html());
                var _3yearReturn = parseFloat($($anchorTag).find("td:nth-child(9)").html());
                var _5yearReturn = parseFloat($($anchorTag).find("td:nth-child(10)").html());
                
                var mfSymbol = mfLink.split("/")[mfLink.split("/").length - 1];
                mfDetails[mfSymbol] = {
                    "mfName": mfName,
                    "mfType": mfType,
                    "moneyControlLink":mfLink,
                    "crisilRank": crisilRank,
                    "aum": aum,
                    "1YearReturn": _1yearReturn,
                    "2YearReturn": _2yearReturn,
                    "3YearReturn": _3yearReturn,
                    "5YearReturn": _5yearReturn
                };
            });
            res.write(JSON.stringify(mfDetails, null, 4));
            res.end(); 
        }
    });
});

var port = process.env.PORT || 90;

app.listen(port, function() {
    console.log('Listening on http://localhost:' + port);
});
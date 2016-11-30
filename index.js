var express = require('express');
var request = require('request');
var app = express();
var cors = require('cors');
var jsdom = require("jsdom");
var addressParser = require('parse-address');

// app.use(cors()); //allows overriding cross origin policy (use npm install if needed)


app.get('/test', function(req, res){ // listens for request on /api route
 console.log('working!');
 res.send('working!'); // if no errors, send the body of data back to front end
});

app.get('/zillow', function(req, res){
  var address = req.query.address,
  zipcode = req.query.zipcode;
  console.log(address, zipcode)
  request({url: 'http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz19hs5hlzz0r_493z4&address=' + address + '&citystatezip=' + zipcode}, function(err, httpResponse, body){
    res.send(body);
  });
});

app.get('/greenville-houses', function(req, res){
  var selldate = req.query.search;

  // looks like a get request like this works:
  // http://mie.greenvilleonline.com/public_approve_query1.php?page=1&searchvar=1&search=12/05/2016
  request('http://mie.greenvilleonline.com/public_approve_query1.php?page=1&searchvar=1&search=' + selldate,
    function(err, httpResponse, body1){
      request('http://mie.greenvilleonline.com/public_approve_query1.php?page=2&searchvar=1&search=' + selldate,
        function(err, httpResponse, body2){
          // parse body1 and body2
          // send back as combined result
          parseTableData(body1, function(body1Json){
            parseTableData(body2, function(body2Json){
              res.send(body1Json.concat(body2Json));
            });
          });
        }
      );
    }
  );
});

/**
 * Takes raw response from greenville county website and scrapes out the
 * house data
 */
function parseTableData(content, callback){
  jsdom.env(
    content,
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      // Get jquery
      var $ = window.$;

      // Process the data
      var $tables = $('table');
      var $dataTable = $($tables.get(6));
      var $dataRows = $dataTable.find('.smallCopy');

      // convert html to json objects with the case number as the objectId
      var data = $dataRows.map(function(index, row){

        var address = addressParser.parseLocation(row.cells.item(2).textContent);

        return {
          date: row.cells.item(0).textContent,
          objectId: row.cells.item(1).textContent,
          address: [address.number, address.prefix, address.street, address.type].filter(Boolean).join(' '),
          zipcode: address.zip,
          city: address.city,
          state: address.state,
          attorney: row.cells.item(3).textContent,
          plaintiff: row.cells.item(4).textContent,
          defendant: row.cells.item(5).textContent,
          soldAmount: row.cells.item(6).textContent
        }
      }).toArray();

      // return the data minus the header row
      callback(data.slice(-10));
    }
  );
}

/* PUT YOUR CODE ABOVE THIS COMMENT */

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server running on port 3000');

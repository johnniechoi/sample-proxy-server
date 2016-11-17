var express = require('express');
var request = require('request');
var app = express();
var cors = require('cors');

app.use(cors()); //allows overriding cross origin policy (use npm install if needed)

app.get('/working', function(req, res){ // listens for request on /api route
 console.log('working!');
 res.send('working!'); // if no errors, send the body of data back to front end
});

/* PUT YOUR CODE BETWEEN COMMENTS */


app.get('/properties', function(req, res){ // listens for request on /api route
  request('http://mie.greenvilleonline.com/public_approve_query1.php', function (error, response, body) { // api url
    if (!error && response.statusCode === 200) {
      console.log('Go buy a house!');
      res.send(body); // if no errors, send the body of data back to front end
    }
  });

});

app.get('/search', function(req, res){
  request.post({url: 'http://mie.greenvilleonline.com/public_approve_query1.php', form: {selldate: '11/07/2016'}}, function(err, httpResponse, body){
   res.send(body);
  });
});

app.get('/zillow', function(req, res){
  var address = req.query.address,
  zipcode = req.query.zipcode;
  console.log(address, zipcode)
  request({url: 'http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=X1-ZWz19hs5hlzz0r_493z4&address=' + address + '&citystatezip=' + zipcode}, function(err, httpResponse, body){
    res.send(body);
  });
});

/* PUT YOUR CODE ABOVE THIS COMMENT */

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server running on port 3000');

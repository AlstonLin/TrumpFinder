var request = require('request')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
app.use(bodyParser());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post('/find', function(req, res) {
  var url = req.body.url;
  console.log("URL: " + url);
  request(url, function(er, response, body) {
    console.log("Response " + body);
    res.end(body);
  }).end();
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

var request = require('request')
var express = require('express');
var app = express();
var cheerio = require('cheerio');
var jsdom = require('jsdom').jsdom;
var bodyParser = require('body-parser');
var path = require('path');
app.use(bodyParser());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post('/find', function(req, res) {
  var url = req.body.url;
  findTrump([url], function (result){
    if (result == null){
      res.end("Trump not found");
    } else {
      res.end(result);
    }
  }, {});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function findTrump(queue, callback, visited){
  if (queue.length != 0){
    var url = queue.shift();
    console.log("Visiting " + url);
    request({
        url: url,
        timeout: 3000
      }, function(err, response, body) {
      if (!err){
        if (hasTrump(body)){
          console.log("Found Trump!");
          callback(body);
        } else{
          console.log("Still looking");
          queue = queue.concat(getLinks(body, extractRoot(url), visited));
          findTrump(queue, callback, visited);
        }
      } else {
        console.log("Error");
        findTrump(queue, callback, visited);
      }
    });
  } else {
    callback(null);
  }
}

function getLinks(body, root, visited){
  var $ = cheerio.load(body);
  links = [];
  $("a").each(function(){
    var link = $(this).attr('href');
    if (link){
      if (link.length > 0 && link.charAt(0) == "/"){
        link = root + link;
      }
      link = normalize(link);
      if (!(link in visited)){
        links.push(link);
        visited[link] = true;
      }
    }
  });
  return links;
}

function hasTrump(str){
  return str.indexOf("Donald Trump") > -1;
}


function extractRoot(url) {
    var domain;
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];
    return domain;
}

function normalize(url) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "http://" + url;
  }
  url.replace("https://", "http://");
  return url;
}

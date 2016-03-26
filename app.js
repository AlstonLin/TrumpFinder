var request = require('request')
var express = require('express');
var app = express();
var http = require('http').Server(app);
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var path = require('path');
var io = require('socket.io')(http);
app.use(bodyParser());
app.use('/public', express.static(__dirname + '/public'));

io.on('connection', function(socket){
  console.log('a user connected');
});


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

io.on('connection', function(socket){
  socket.on('find', function(url) {
    console.log("Find request with url=" + url);
    findTrump(socket, [{ generation: 0, url: url}], function (result){
      if (result == null){
        socket.emit("result", "Trump not found");
      } else {
        socket.emit("result" , result);
      }
    }, {});
  });
});

http.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function findTrump(socket, queue, callback, visited){
  if (queue.length != 0){
    var item = queue.shift();
    console.log("Visiting " + item.url);
    request({
        url: item.url,
        timeout: 3000
      }, function(err, response, body) {
      if (!err){
        if (hasTrump(body)){
          console.log("Found Trump!");
          callback(body);
        } else{
          console.log("Still looking");
          var links = getLinks(body, extractRoot(item.url), visited, item.generation);
          queue = queue.concat(links);
          socket.emit("visit", {
            newLinks : links
          });
          findTrump(socket, queue, callback, visited);
        }
      } else {
        console.log("Error");
        findTrump(socket, queue, callback, visited);
      }
    });
  } else {
    callback(null);
  }
}

function getLinks(body, root, visited, oldGeneration){
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
        links.push({
          generation: oldGeneration + 1,
          url: link
        });
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

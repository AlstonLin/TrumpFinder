var socket = io();
$('form').submit(function(){
  socket.emit('find', $('#url').val());
  return false
});
socket.on('result', function(result){
  result = replaceTrump(result);
  // Screw it
  setTimeout(function(){
    changeImages(result);
  }, 1000)
  $("#content").html(result);
});
socket.on("visit", function(visit){
  for (var i in visit.newLinks){
    var row = $("#visits" + visit.newLinks[i].generation);
    if (row.length == 0){
      var randColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      $("#tree").append('<div id="visits' + visit.newLinks[i].generation + '" style="background-color: ' + randColor + ';"></div>');
      row = $("#visits" + visit.newLinks[i].generation);
    }
    row.append(" " + visit.newLinks[i].url + "<br/>");
    window.scrollTo(0,document.body.scrollHeight);
  }
});

function replaceTrump(result){
  var src_str = result;
  var term = "Donald Trump";
  term = term.replace(/(\s+)/,"(<[^>]+>)*$1(<[^>]+>)*");
  var pattern = new RegExp("("+term+")", "gi");
  src_str = src_str.replace(pattern, "<h1 class='trump'>$1</h1>");
  src_str = src_str.replace(/(<h1>[^<>]*)((<[^>]+>)+)([^<>]*<\/h1>)/,"$1</h1>$2<h1>$4");
  return src_str;
}

function changeImages(){
  $('img').each(function(){
    var img = $(this);
    console.log("FUNCTION CALLED")
    console.log(this.src);
    isTrump(this.src, function(isTrump){
      img.attr('src', "http://ichef.bbci.co.uk/news/976/cpsprodpb/3B3F/production/_88576151_short.jpg");
    });
  });
}

function isTrump(url, callback){
  var key = "58ef7fd3870e810561d0a9786d6f5a6d34750362";
  $.ajax({
    type: "GET",
    url: "http://gateway-a.watsonplatform.net/calls/url/URLGetRankedImageFaceTags",
    data: {
      apikey: key,
      url: url,
      outputMode: "json"
    }
  }).done(function (response){
    if ("imageFaces" in response){
      var faces = response["imageFaces"];
      var isTrump = false;
      for (var i = 0; i < faces.length; i++){
        if ("identity" in faces[i]){
          if (faces[i]["identity"]["name"] == "Donald Trump"){
            isTrump = true;
          }
        }
      }
      callback(isTrump);
    }
  });;
}

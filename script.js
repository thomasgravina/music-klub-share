function extractGroovesharkInfo()
{
  var artist = $('#now-playing-metadata > div > a').html();
  var title = $('#now-playing-metadata > a').html();
  var link = $('#page-nav > div > ul > li a').attr('href');
  var url = 'http://grooveshark.com/' + link;
  return { artist: artist, title: title, url: url };
}

function extractJangoInfo()
{
  var trackInfo = document.title.replace(' - Jango', '').split(': ');
  var artist = trackInfo[0];
  var title = trackInfo[1];
  var url = 'no jango url';
  return { artist: artist, title: title, url: url };
}

function extractSpotifyInfo()
{
  var trackInfo = document.title.replace(' - Spotify', '').split(' - ');
  var artist = trackInfo[1];
  var title = trackInfo[0].replace('▶ ', '');
  var url = 'no spotify url';
  return { artist: artist, title: title, url: url };
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  var info;
  if (request.request == 'getSpotifyInfo')
  {
    info = extractSpotifyInfo();
  }
  else if (request.request == 'getGroovesharkInfo')
  {
    info = extractGroovesharkInfo();
  }
  else if (request.request == 'getJangoInfo')
  {
    info = extractJangoInfo();
  }
  sendResponse({trackInfo: info});
});

// Spotify
var SPOTIFY_INFO_URL        = 'https://api.spotify.com/v1/tracks/';
var SPOTIFY_SEARCH_URL      = 'https://api.spotify.com/v1/search?type=track&limit=1&q=';
var SPOTIFY_HTTP_PREFIX     = 'https://play.spotify.com/';
var SPOTIFY_HTTP_OPEN_PREFIX= 'http://open.spotify.com/track/';
var SPOTIFY_URI_PREFIX      = 'spotify:track:';

// Soundcloud
var SOUNDCLOUD_API_KEY      = '130392b873d9e971389a2999f53f4de6';
var SOUNDCLOUD_INFO_URL     = 'https://api.soundcloud.com/tracks.json?client_id=' + SOUNDCLOUD_API_KEY + '&q=';
var SOUNDCLOUD_HTTP_PREFIX  = 'http://soundcloud.com/';
var SOUNDCLOUD_HTTPS_PREFIX = 'https://soundcloud.com/';

// Youtube
var YOUTUBE_API_KEY         = 'AIzaSyCyjUwmNqcZm9DP6sUNsUutTfhvRndD3no';
var YOUTUBE_INFO_URL        = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&key=' + YOUTUBE_API_KEY + '&id=';
var YOUTUBE_SEARCH_URL      = 'https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&type=video&key=' + YOUTUBE_API_KEY + '&max-results=10&q=';
var YOUTUBE_HTTP_PREFIX     = 'http://www.youtube.com/watch?v=';
var YOUTUBE_HTTPS_PREFIX    = 'https://www.youtube.com/watch?v=';

// Grooveshark
var GROOVESHARK_HTTP_PREFIX = 'http://grooveshark.com/';
var GROOVESHARK_KEY         = 'multiservice5';
var GROOVESHARK_SECRET      = 'c26fa2b1fb1e37f0b504a522c07ca08e';

// Jango
var JANGO_HTTP_PREFIX       = 'http://www.jango.com/';

function getUrlVars(url)
{
  var vars = {};
  var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value)
  {
    vars[key] = value;
  });
  return vars;
}

function prependTitle(title)
{
  $('#info').val(title + '\n' + $('#info').val());
  $('#info').select();
}

function appendResult(result)
{
  $('#info').val($('#info').val() + '\n' + result);
  $('#info').select();
}

function isSpotifyLink(link)
{
  return link.indexOf(SPOTIFY_HTTP_PREFIX) == 0;
}

function isSpotifyUri(link)
{
  return link.indexOf(SPOTIFY_URI_PREFIX) == 0;
}

function isSoundcloudLink(link)
{
  return link.indexOf(SOUNDCLOUD_HTTPS_PREFIX) == 0 || link.indexOf(SOUNDCLOUD_HTTP_PREFIX) == 0;
}

function isYoutubeLink(link)
{
  return link.indexOf(YOUTUBE_HTTPS_PREFIX) == 0 || link.indexOf(YOUTUBE_HTTP_PREFIX) == 0;
}

function isGroovesharkLink(link)
{
  return link.indexOf(GROOVESHARK_HTTP_PREFIX) == 0;
}

function isJangoLink(link)
{
  return link.indexOf(JANGO_HTTP_PREFIX) == 0;
}

function getIdFromLink(link)
{
  if (isYoutubeLink(link))
  {
    return getUrlVars(link)['v'];
  }
  var splitChar = '/';
  if (isSpotifyUri(link))
  {
    splitChar = ':';
  }
  var splitedUrl = link.split(splitChar);
  return splitedUrl[splitedUrl.length - 1];
}

function searchYoutube(title)
{
  $.get(YOUTUBE_SEARCH_URL + title, function(data)
  {
    console.log(data);
    var videoId = data['items'][0]['id']['videoId'];
    appendResult(YOUTUBE_HTTPS_PREFIX + videoId);
  });
}

function searchSoundcloud(title)
{
  $.get(SOUNDCLOUD_INFO_URL + title, function(data)
  {
    if (data.length > 0)
    {
      var link = data[0]['permalink_url'];
      appendResult(link);
    }
  });
}

function searchSpotify(title)
{
  $.get(SPOTIFY_SEARCH_URL + title, function(data)
  {
    var items = data['tracks']['items'];
    if (items.length == 0)
      return;
    var id = items[0]['id'];
    appendResult(SPOTIFY_HTTP_PLAY_PREFIX + id);
    appendResult(SPOTIFY_URI_PREFIX + id);
  });
}

function getYoutubeTrackInfo(trackId)
{
  $.get(YOUTUBE_INFO_URL + trackId, function(data)
  {
    var title = data['items'][0]['snippet']['title'];
    prependTitle(title);
    searchSoundcloud(title);
    searchSpotify(title);
  });
}

function getSoundcloudTrackInfo(trackId)
{
  $.get(SOUNDCLOUD_INFO_URL + trackId, function(data)
  {
    console.log(data);
    var title = data[0]['title'];
    var link = data[0]['permalink_url'];
    prependTitle(title);
    appendResult(link + '*');
    searchYoutube(title);
    searchSpotify(title);
  });
}

function searchFromTrackInfo(trackInfo)
{
  var title = trackInfo.title;
  var artist = trackInfo.artist;
  var url = trackInfo.url;
  prependTitle(artist + ' - ' + title);
  appendResult(url + ' *');
  searchSpotify(title);
  searchYoutube(title + ' ' + artist);
  searchSoundcloud(title + ' ' + artist);
}

function getTrackInfo(method)
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
  {
    chrome.tabs.sendMessage(tabs[0].id, {request: method}, function(response)
    {
      if (response != undefined)
      {
        console.log('Received response:');
        console.log(response.trackInfo);
        searchFromTrackInfo(response.trackInfo);
      }
    });
  });
}

function search(url)
{
  if (url.length == 0)
    return;

  var trackId = getIdFromLink(url);

  if (isSpotifyLink(url))
  {
    getTrackInfo('getSpotifyInfo');
  }
  else if (isYoutubeLink(url))
  {
    appendResult(url + ' *');
    getYoutubeTrackInfo(trackId);
  }
  else if (isSoundcloudLink(url))
  {
    getSoundcloudTrackInfo(trackId);
  }
  else if (isGroovesharkLink(url))
  {
    getTrackInfo('getGroovesharkInfo');
  }
  else if (isJangoLink(url))
  {
    getTrackInfo('getJangoInfo');
  }
}

chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
{
  search(tabs[0].url);
});

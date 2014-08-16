// http://open.spotify.com/track/1F8cDjKw5dNvkSJkyezfaO
// spotify:track:1F8cDjKw5dNvkSJkyezfaO
// https://www.youtube.com/watch?v=R7oL5ENKIKU
// https://soundcloud.com/miniaturesrec/bellanova-stairway-to-heaven

// Spotify
var SPOTIFY_INFO_URL        = 'https://api.spotify.com/v1/tracks/';
var SPOTIFY_SEARCH_URL      = 'https://api.spotify.com/v1/search?type=track&limit=1&q=';
var SPOTIFY_HTTP_PREFIX     = 'http://open.spotify.com/track/';
var SPOTIFY_URI_PREFIX      = 'spotify:track:';

// Soundcloud
var SOUNDCLOUD_API_KEY      = '130392b873d9e971389a2999f53f4de6';
var SOUNDCLOUD_INFO_URL     = 'https://api.soundcloud.com/tracks.json?client_id=' + SOUNDCLOUD_API_KEY + '&q=';
var SOUNDCLOUD_HTTP_PREFIX  = 'http://soundcloud.com/';
var SOUNDCLOUD_HTTPS_PREFIX = 'https://soundcloud.com/';

// Youtube
var YOUTUBE_API_KEY      = 'AIzaSyCyjUwmNqcZm9DP6sUNsUutTfhvRndD3no';
var YOUTUBE_INFO_URL        = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&key=' + YOUTUBE_API_KEY + '&id=';
var YOUTUBE_SEARCH_URL      = 'https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&type=video&key=' + YOUTUBE_API_KEY + '&max-results=10&q=';
var YOUTUBE_HTTP_PREFIX     = 'https://www.youtube.com/watch?v=';
var YOUTUBE_HTTPS_PREFIX    = 'https://www.youtube.com/watch?v=';

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
    var videoId = data['items'][0]['id']['videoId'];
    appendResult(YOUTUBE_HTTPS_PREFIX + videoId);
  });
}

function searchSoundcloud(title)
{
  $.get(SOUNDCLOUD_INFO_URL + title, function(data)
  {
    var link = data[0]['permalink_url'];
    appendResult(link);
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
    appendResult(SPOTIFY_HTTP_PREFIX + id);
    appendResult(SPOTIFY_URI_PREFIX + id);
  });
}

function getSpotifyTrackInfo(trackId)
{
  $.get(SPOTIFY_INFO_URL + trackId, function(data)
  {
    var title = data['name'];
    prependTitle(title);
    appendResult(SPOTIFY_HTTP_PREFIX + trackId + '*');
    appendResult(SPOTIFY_URI_PREFIX + trackId + '*');
    searchYoutube(title);
    searchSoundcloud(title);
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
    var title = data[0]['title'];
    var link = data[0]['permalink_url'];
    prependTitle(title);
    appendResult(link + '*');
    searchYoutube(title);
    searchSpotify(title);
  });
}

function search(url)
{
  if (url.length == 0)
    return;

  var trackId = getIdFromLink(url);

  if (isSpotifyLink(url) || isSpotifyUri(url))
  {
    getSpotifyTrackInfo(trackId);
  }
  else if (isYoutubeLink(url))
  {
    appendResult(url + '*');
    getYoutubeTrackInfo(trackId);
  }
  else if (isSoundcloudLink(url))
  {
    getSoundcloudTrackInfo(trackId);
  }
}

chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
{
  search(tabs[0].url);
});
chrome.runtime.onInstalled.addListener(function()
{
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function()
  {
    chrome.declarativeContent.onPageChanged.addRules([
    {
      conditions:
      [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'youtube' },
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'soundcloud' },
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'spotify' },
        })
      ],
      actions: [ new chrome.declarativeContent.ShowPageAction() ]
    }]);
  });
});
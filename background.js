chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (!tab || !tab.url || tab.url.startsWith("chrome")) return undefined;

    console.log(tab.url);
    if (changeInfo.status === 'complete' && tab.active) {
        chrome.scripting.insertCSS({
            target: {tabId: tabId, allFrames: true},
            files: ['zentao.css'],
        });
        chrome.scripting.executeScript({
            target: {tabId: tabId, allFrames: true},
            files: ['zentao.js'],
        });
    }
});
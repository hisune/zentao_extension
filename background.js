chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
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
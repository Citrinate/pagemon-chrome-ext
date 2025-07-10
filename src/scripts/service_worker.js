chrome.runtime.onStartup.addListener(() => {});

let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['WORKERS'],
      justification: 'reason for needing the document',
    });
    await creating;
    creating = null;
  }
}

setupOffscreenDocument('background.htm');

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", request);
      
        switch (request.type) {
            case "i18n.getMessage":
                sendResponse(chrome.i18n.getMessage(...request.params));
                break;

            case "extension.getViews":
                sendResponse(chrome.extension.getViews(...request.params));
                break;

            case "notifications.create":
                createNotification(...request.params);
                break;

            case "notifications.clear":
                clearNotification();
                break;

            case "action.setBadgeBackgroundColor":
                sendResponse(chrome.action.setBadgeBackgroundColor(...request.params));
                break;

            case "action.setBadgeText":
                sendResponse(chrome.action.setBadgeText(...request.params));
                break;

            case "action.setIcon":
                sendResponse(chrome.action.setIcon(...request.params));
                break;

            default:
                break;
        }
    }
);

var e = [];
var d = false;
var notificationID = null;

function createNotification(updatedPages, timeout) {
    if (0 != updatedPages.length) {
        title = 1 == updatedPages.length ? chrome.i18n.getMessage("page_updated_single") : chrome.i18n.getMessage("page_updated_multi", updatedPages.length.toString());
        var c = updatedPages.map(function(page) {
            return {
                title: page.name
            }
        });
        c = {
            type: "basic",
            iconUrl: chrome.runtime.getURL("img/icon_128.png"),
            title: title,
            message: "",
            buttons: c
        };
        e = updatedPages;
        if (notificationID != null) {
            clearNotification();
        }
        chrome.notifications.create("", c, function(b) {
            notificationID = b;
        })
        if (d == false) {
            d = true;
            chrome.notifications.onButtonClicked.addListener(function(b,a) {
                var c = e[a];
                chrome.runtime.sendMessage({type: "bgNotificationClicked", params: [c.url]});
            })
        }
    }
    6E4 >= timeout && setTimeout(function() { chrome.runtime.sendMessage({type: "bgHideDesktopNotification", params: []}) }, timeout)
};

function clearNotification() {
    null != notificationID && ("string" == typeof notificationID ? chrome.notifications.clear(notificationID) : notificationID.cancel(), notificationID = null)
}

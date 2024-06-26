var RECORD_HEIGHT = "2.7em";

function getNotificationUrl(a) {
    return $(a).closest(".notification").find(".page_link").attr("href")
}

function markPageVisited() {
    var a = getNotificationUrl(this),
        b = this;
    bgSetPageSettings(a, {
        updated: !1
    })
    bgUpdateBadge();
    bgTakeSnapshot(a).then(function() { bgScheduleCheck() });
    $(b).closest(".notification td").slideUp("slow", function() {
        1 == $("#notifications .notification").length ? $("#notifications").animate({
            height: "2.7em",
            opacity: 1
        }, "slow", fillNotifications) : fillNotifications()
    })
}

function monitorCurrentPage() {
    $("#monitor_page").addClass("inprogress");
    getCurrentTab(function(a) {
        addPage({
            url: a.url,
            name: a.title
        }).then(function() {
            bgTakeSnapshot(a.url);
            $("#monitor_page").removeClass("inprogress");
            updateButtonsState();
            var b = chrome.extension.getViews({
                type: "tab"
            });
            if (b)
                for (var c = 0; c < b.length; c++) b[c].fillPagesList && b[c].fillPagesList()
        })
    })
}

function trimPageName(a) {
    a = a.name || chrome.i18n.getMessage("untitled", a.url);
    60 < a.length && (a = a.replace(/([^]{20,60})(\w)\b.*$/, "$1$2..."));
    return a
}

function fillNotifications(a) {
    getAllUpdatedPages(function(b) {
        $("#notifications").html("");
        0 < b.length ? $.each(b, function(a, b) {
            var c = $("#templates .notification").clone(),
                d = trimPageName(b);
            c.find(".page_link").attr("href", b.url).text(d);
            c.find(".favicon").attr({
                src: getFavicon(b.url)
            });
            c.find(".view_diff").attr({
                href: "diff.htm#" + btoa(b.url)
            });
            c.appendTo("#notifications")
        }) : $("#templates .empty").clone().appendTo("#notifications");
        updateButtonsState();
        (a || $.noop)()
    })
}

function updateButtonsState() {
    getCurrentTab(function(a) {
        isPageMonitored(a.url, function(b) {
            var c = /^https?:/.test(a.url);
            $("#monitor_page").toggle(!b);
            $("#stop_monitoring").toggle(b);
            $("#options").toggle(b);
            b || (c ? ($("#monitor_page").click(monitorCurrentPage).removeClass("inactive"), $("#monitor_page img").attr("src", "img/monitor.png"), $("#monitor_page span").text(chrome.i18n.getMessage("monitor"))) : ($("#monitor_page").unbind("click").addClass("inactive"), $("#monitor_page img").attr("src",
                "img/monitor_inactive.png"), b = b ? "page_monitored" : "monitor", $("#monitor_page span").text(chrome.i18n.getMessage(b))))
        })
    });
    $("#notifications .notification").length ? ($("#view_all").removeClass("inactive"), $("#view_all img").attr("src", "img/view_all.png")) : ($("#view_all").addClass("inactive"), $("#view_all img").attr("src", "img/view_all_inactive.png"));
    getAllPageURLs(function(a) {
        getAllUpdatedPages(function(b) {
            a.length == b.length ? ($("#check_now").addClass("inactive"), $("#check_now img").attr("src", "img/refresh_inactive.png")) :
                ($("#check_now").removeClass("inactive"), $("#check_now img").attr("src", "img/refresh.png"))
        })
    })
}

function checkAllPages() {
    getAllPageURLs(function(a) {
        var b = $("#notifications .notification").length;
        0 >= a.length - b || ($("#check_now").unbind("click"), a = 0 < b ? {
            height: "2.7em",
            opacity: .01
        } : {
            opacity: .01
        }, $("#notifications").animate(a, "slow", function() {
            $(this).html("").addClass("loading");
            $("#templates .loading_spacer").clone().appendTo($(this));
            $(this).show().animate({
                opacity: 1
            }, 400)
        }), bgCheck(!0).then(function() {
            $("#notifications").animate({
                opacity: 0
            }, 400, function() {
                var a = $(this);
                fillNotifications(function() {
                    var b =
                        a.height(),
                        c = a.html();
                    a.removeClass("loading").html("").css("height", "2.7em");
                    a.animate({
                        height: b + "px"
                    }, "slow", function() {
                        a.css("height", "auto").html(c).animate({
                            opacity: 1
                        }, 400);
                        $("#check_now").click(checkAllPages)
                    })
                })
            })
        }))
    })
}

function openAllPages() {
    var a = getSetting(SETTINGS.view_all_action);
    $("#notifications ." + ("diff" == a ? "view_diff" : "page_link")).click()
}

function openLinkInNewTab(a) {
    var b = this.href.replace(/#.+/, "");
    chrome.tabs.query({
        url: b
    }, function(a) {
        a.length ? (a = a[0].id, chrome.tabs.reload(a), chrome.tabs.update(a, {
            selected: !0
        })) : chrome.tabs.create({
            url: b,
            selected: !1
        })
    });
    a.preventDefault()
}

function openDiffPage() {
    var a = "diff.htm#" + btoa(getNotificationUrl(this));
    chrome.tabs.create({
        url: a,
        selected: !1
    })
}

function stopMonitoring() {
    removePage(getNotificationUrl(this))
}

function setUpHandlers() {
    $("#monitor_page").click(monitorCurrentPage);
    $("#check_now").click(checkAllPages);
    $("#view_all").click(openAllPages);
    $("#stop_monitoring").click(function() {
        getCurrentTab(function(a) {
            removePage(a.url, updateButtonsState)
        })
    });
    $("#options").click(function() {
        getCurrentTab(function(a) {
            a = chrome.runtime.getURL("options.htm") + "#" + btoa(a.url);
            chrome.tabs.create({
                url: a,
                selected: !0
            })
        })
    });
    $(".page_link,.mark_visited,.view_diff,.stop_monitoring").live("click",
        markPageVisited);
    $(".page_link").live("click", openLinkInNewTab);
    $(".view_diff").live("click", openDiffPage);
    $(".stop_monitoring").live("click", stopMonitoring);
    $(window).resize(function() {
        var a = $("html").get(0);
        a = a.scrollHeight > a.clientHeight ? "1em" : "0";
        $("body").css("margin-right", a)
    })
};

function getCurrentTab(callback) {
    let queryOptions = { active: true, currentWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (chrome.runtime.lastError)
        console.error(chrome.runtime.lastError);
      // `tab` will either be a `tabs.Tab` instance or `undefined`.
      callback(tab);
    });
  }

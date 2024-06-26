var MIN_TIME_TEXTBOX_VALUE = .8;

function isValidRegex(a) {
    try {
        new RegExp(a)
    } catch (b) {
        return !1
    }
    return !0
}

function isValidSelector(a) {
    if ("#" == a) return !1;
    try {
        $(a)
    } catch (b) {
        return !1
    }
    return !0
}

function shadeBackground(a) {
    var b = $("#shader");
    0 == b.length && (b = $('<div id="shader" />').appendTo("body"));
    b.height($("body").get(0).scrollHeight);
    a ? b.css("display", "block").animate({
        opacity: .7
    }) : b.animate({
        opacity: 0
    }, function() {
        b.css("display", "none")
    })
}

function findUrl(a) {
    return $(a).closest(".page_record").find(".page_link").get(0).href
}

function findPageRecord(a) {
    "string" == typeof a && (a = '.page_link[href="' + a + '"]');
    return $(a).closest(".page_record")
}

function timeLogToAbsolute(a) {
    a = Math.pow(1.5, a);
    return 1 > a ? Math.round(100 * a) / 100 : 10 > a ? Math.round(10 * a) / 10 : Math.round(a)
}

function timeAbsoluteToLog(a) {
    return Math.log(a) / Math.log(1.5)
}

function updatePageModeControls(a, b) {
    a.find(".mode .mode_string").toggleClass("invalid", !b);
    a.find(".mode .mode_test").attr({
        disabled: !b
    })
}

function setPageCheckInterval(a, b) {
    var c = 6E4 * parseFloat(b) || null;
    setPageSettings(a, {
        check_interval: c
    }, bgScheduleCheck)
}

function setPageRegexOrSelector(a, b, c) {
    if ("regex" != b && "selector" != b) throw Error("Invalid mode.");
    if (null === c) setPageSettings(a, {
        mode: "text",
        regex: null,
        selector: null
    });
    else {
        var e = "regex" == b,
            d = c && (e ? isValidRegex : isValidSelector)(c);
        updatePageModeControls(findPageRecord(a), d);
        d && (b = {
            mode: b
        }, e ? b.regex = c : b.selector = c, setPageSettings(a, b))
    }
}

function exportPagesList(a) {
    a && getAllPages(function(b) {
        var c = [],
            e = Date.now();
        c.push('<!DOCTYPE NETSCAPE-Bookmark-file-1>\n\n\x3c!-- This is an automatically generated file.\n     It will be read and overwritten.\n     DO NOT EDIT! --\x3e\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n');
        for (var d in b) {
            c.push('        <DT><A HREF="' + b[d].url + '" ADD_DATE="' + e + '">' + b[d].name + "</A>\n");
            var f = JSON.stringify({
                mode: b[d].mode,
                regex: b[d].regex,
                selector: b[d].selector,
                check_interval: b[d].check_interval,
                crc: b[d].crc,
                last_check: b[d].last_check,
                last_changed: b[d].last_changed
            }).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            c.push("            \x3c!--PageMonitorAdvancedPageData=" + f + "--\x3e\n")
        }
        c.push("</DL><p>");
        a(c.join(""))
    })
}

async function importPagesList(a) {
    for (var b = RegExp("(<[aA][^<>]+>[^<>]+</[aA]>)(?:\\s*\x3c!--PageMonitorAdvancedPageData=({.*?})--\x3e)?", "g"), c, e = 0; c = b.exec(a, b.lastIndex);) {
        var d = $(c[1]),
            f = d.attr("HREF") || "";
        d = d.text() || chrome.i18n.getMessage("untitled", f);
        var g = {};
        c[2] && (g = JSON.parse(c[2].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")));
        f && (await addPage($.extend({
            url: f,
            name: d
        }, g)), e++)
    }
    return e
}

function initializeGlobalControls() {
    initializeColorPicker();
    initializeAnimationToggler();
    initializeSorter();
    initializeIntervalSliders();
    initializeNotificationsToggler();
    initializeNotificationsTimeout();
    initializeSoundSelector();
    initializeSoundPlayer();
    initializeSoundCreator();
    initializeViewAllSelector();
    initializeHideDeletionsToggler();
    initializeShowFullPageDiff();
    initializeExporter();
    initializeImporter();
    initializeGlobalChecker();
    initializeAdvancedSwitch()
}

function initializeColorPicker() {
    var a = function(a) {
            return 16 <= a ? a.toString(16) : "0" + a.toString(16)
        },
        b = getSetting(SETTINGS.badge_color) || [0, 180, 0, 255];
    b = "#" + a(b[0]) + a(b[1]) + a(b[2]);
    $("#badge_color input").val(b).change(function() {
        var a = $(this).val();
        setSetting(SETTINGS.badge_color, [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16), 255]);
        bgUpdateBadge()
    }).colorPicker()
}

function initializeAnimationToggler() {
    $("#animation select").change(function() {
        var a = "enabled" != $(this).val();
        setSetting(SETTINGS.animations_disabled, a);
        $.fx.off = a
    }).val(getSetting(SETTINGS.animations_disabled) ? "disabled" : "enabled")
}

function initializeSorter() {
    $("#sort select").change(function() {
        setSetting(SETTINGS.sort_by, $(this).val());
        fillPagesList()
    }).val(getSetting(SETTINGS.sort_by) || "date added")
}

function initializeIntervalSliders() {
    var a = (getSetting(SETTINGS.check_interval) || 108E5) / 6E4,
        b = $("#basic_interval input[type=range]"),
        c = $("#basic_interval .range_value_label"),
        e = $("#interval input"),
        d = $("#interval .check_every_label");
    e.val(a).change(function() {
        var a = 6E4 * parseFloat($(this).val());
        5E3 > a && (a = 5E3);
        1995E5 < a && (a = 1995E5);
        var c = a / 6E4;
        e.val(c);
        b.val(timeAbsoluteToLog(c)).change();
        c = 1 == c ? chrome.i18n.getMessage("minute") : chrome.i18n.getMessage("minutes", "2");
        d.text(c.split(" ")[1]);
        setSetting(SETTINGS.check_interval,
            a)
    }).change();
    b.val(timeAbsoluteToLog(a)).change(async function() {
        var a = 6E4 * timeLogToAbsolute(parseFloat($(this).val()));
        b.siblings(".range_value_label").text(await describeTime(a))
    }).mouseup(function() {
        var a = timeLogToAbsolute(parseFloat($(this).val())),
            b = 6E4 * a;
        e.val(a);
        setSetting(SETTINGS.check_interval, b)
    }).mouseup().change();
    a = b.offset();
    var f = b.width();
    b.height();
    var g = c.width();
    c.height();
    c.css({
        left: a.left + f / 2 - g / 2
    })
}

function initializeNotificationsToggler() {
    var a = $("#notifications select, #basic_notifications select");
    a.change(function() {
        var b = $(this).val();
        a.not(this).val(b);
        setSetting(SETTINGS.notifications_enabled, "enabled" == b);
        $("#notifications_timeout input").attr("disabled", "enabled" != b)
    }).val(getSetting(SETTINGS.notifications_enabled) ? "enabled" : "disabled")
}

function initializeNotificationsTimeout() {
    var a = getSetting(SETTINGS.notifications_timeout) / 1E3 || 30;
    $("#notifications_timeout input").val(a).change(async function() {
        var a = 1E3 * parseFloat($(this).val());
        a = 6E4 < a ? chrome.i18n.getMessage("until_closed") : await describeTime(a);
        $(this).siblings(".range_value_label").text(a)
    }).mouseup(function() {
        var a = 1E3 * parseFloat($(this).val());
        setSetting(SETTINGS.notifications_timeout, a)
    }).change().attr("disabled", !getSetting(SETTINGS.notifications_enabled))
}

function initializeSoundSelector() {
    var a = $("#sound_alert select, #basic_sound_alert select"),
        b = $("#play_sound"),
        c = $("#delete_sound"),
        e = getSetting(SETTINGS.custom_sounds) || [];
    $.each(e, function(b, c) {
        $("<option>").text(c.name).attr("value", c.url).appendTo(a)
    });
    a.change(function() {
        var e = $(this).val();
        a.not(this).val(e);
        setSetting(SETTINGS.sound_alert, e);
        b.attr({
            disabled: "" == e
        });
        c.attr({
            disabled: /^$|^chrome-extension:/.test(e)
        })
    });
    a.val(getSetting(SETTINGS.sound_alert) || "");
    a.change()
}

function initializeSoundPlayer() {
    var a = $("#sound_alert select"),
        b = $("#play_sound"),
        c = $("#delete_sound");
    b.click(function() {
        a.attr("disabled", !0);
        b.attr("disabled", !0);
        c.attr("disabled", !0);
        var e = new Audio(a.val());
        e.addEventListener("ended", function() {
            a.attr("disabled", !1);
            b.attr("disabled", !1);
            c.attr("disabled", !1)
        });
        e.play()
    })
}

function initializeSoundCreator() {
    var a = $("#new_sound"),
        b = $("#new_sound_form");
    b.css({
        top: (window.innerHeight - b.height()) / 2,
        left: (window.innerWidth - b.width()) / 2
    });
    a.click(function() {
        $("input", b).val("");
        shadeBackground(!0);
        b.fadeIn()
    });
    $("#new_sound_cancel").click(function() {
        shadeBackground(!1);
        b.fadeOut()
    });
    $("#new_sound_create").click(function() {
        var a = $("#new_sound_name").val(),
            e = $("#new_sound_url").val(),
            d = $(this);
        if (e && a) {
            d.attr("disabled", !0);
            d.css("cursor", "progress");
            var f = function() {
                    d.attr("disabled",
                        !1);
                    d.css("cursor", "auto")
                },
                g = new Audio(e);
            g.addEventListener("error", function() {
                alert(chrome.i18n.getMessage("new_sound_failed"));
                f()
            });
            g.addEventListener("canplaythrough", function() {
                var c = getSetting(SETTINGS.custom_sounds) || [];
                c.push({
                    name: a,
                    url: e
                });
                setSetting(SETTINGS.custom_sounds, c);
                $("<option>").text(a).attr("value", e).appendTo("#sound_alert select, #basic_sound_alert select");
                f();
                shadeBackground(!1);
                b.fadeOut()
            })
        } else alert(chrome.i18n.getMessage("new_sound_prompt"))
    });
    $("#delete_sound").click(function() {
        var a =
            $("#sound_alert select"),
            b = a.val(),
            d = getSetting(SETTINGS.custom_sounds) || [];
        setSetting(SETTINGS.custom_sounds, d.filter(function(a) {
            return a.url != b
        }));
        $("option:selected", a).remove();
        a.val("")
    })
}

function initializeViewAllSelector() {
    $("#view_all select").change(function() {
        setSetting(SETTINGS.view_all_action, $(this).val())
    }).val(getSetting(SETTINGS.view_all_action) || "diff")
}

function initializeHideDeletionsToggler() {
    $("#hide_deletions input:checkbox").change(function() {
        var a = $(this).prop("checked");
        setSetting(SETTINGS.hide_deletions, a)
    }).prop("checked", getSetting(SETTINGS.hide_deletions))
}

function initializeShowFullPageDiff() {
    $("#show_full_page_diff input:checkbox").change(function() {
        var a = $(this).prop("checked");
        setSetting(SETTINGS.show_full_page_diff, a)
    }).prop("checked", getSetting(SETTINGS.show_full_page_diff))
}

function initializeExporter() {
    var a = $("#export_form");
    $("#export").click(function() {
        exportPagesList(function(b) {
            $("textarea", a).val(b);
            shadeBackground(!0);
            a.fadeIn()
        })
    });
    $("button", a).click(function() {
        a.fadeOut();
        shadeBackground(!1)
    })
}

function initializeImporter() {
    var a = $("#import_form");
    $("#import").click(function() {
        shadeBackground(!0);
        a.fadeIn()
    });
    $("#import_cancel", a).click(function() {
        a.fadeOut();
        shadeBackground(!1)
    });
    $("#import_perform", a).click(async function() {
        var b = 0;
        try {
            b = await importPagesList($("textarea", a).val())
        } catch (c) {
            console.log(c);
            alert(chrome.i18n.getMessage("import_error"));
            a.fadeOut();
            shadeBackground(!1);
            return
        }
        b ? (chrome.i18n.getMessage("import_success_single"), chrome.i18n.getMessage("import_success_multi", b.toString()), fillPagesList(function() {})) :
            alert(chrome.i18n.getMessage("import_empty"));
        a.fadeOut();
        shadeBackground(!1)
    })
}

function initializeGlobalChecker() {
    $("#check_all").click(function() {
        getAllPageURLs(function(a) {
            a = chrome.i18n.getMessage("check_in_progress") + "..";
            $(".last_check_time").text(a);
            bgCheck(!0).then(function() {
                $(".last_check_time").trigger("time_updated")
            })
        })
    })
}
(function() {
    var a = !1;
    initializeAdvancedSwitch = function() {
        if (a) return !1;
        a = !0;
        $("#options_switch input").click(function() {
            var b = $(this).is(":checked"),
                c = b ? "hidden" : "visible";
            $("#basic_interval .range_value_label").css("visibility", c);
            var e = b ? "#advanced_options" : "#basic_options";
            $(b ? "#basic_options" : "#advanced_options").slideUp("slow", function() {
                $(e).slideDown("slow", function() {
                    a = !1
                })
            })
        })
    }
})();

function initializePageControls() {
    initializePageRename();
    initializePageRemove();
    initializePageCheck();
    initializePageAdvancedToggler();
    initializePageCheckInterval();
    initializePageModeSelector();
    initializePageModeTester();
    initializePageModePicker()
}

function initializePageRename() {
    $(".rename").live("click", function() {
        var a = findPageRecord(this).find(".page_link");
        if (!a.is(":hidden")) {
            var b = $('<input type="text" value="' + a.text() + '" />'),
                c = $('<input type="button" value="' + chrome.i18n.getMessage("cancel") + '" />'),
                e = $('<input type="button" value="' + chrome.i18n.getMessage("ok") + '" />');
            a.hide().after(c).after(e).after(b);
            b.focus().keyup(function(a) {
                13 == a.which ? e.click() : 27 == a.which && c.click()
            });
            c.click(function() {
                b.remove();
                e.remove();
                c.remove();
                a.show()
            });
            e.click(function() {
                a.text(b.val());
                setPageSettings(findUrl(this), {
                    name: b.val()
                });
                c.click()
            })
        }
    })
}

function initializePageRemove() {
    $(".stop_monitoring").live("click", function() {
        var a = findUrl(this);
        removePage(a, bgUpdateBadge);
        var b = scrollY;
        $("td", findPageRecord(this)).slideUp("slow", function() {
            1 == $("#pages .page_record").length ? $("#pages").animate({
                height: "50px",
                opacity: 1
            }, "slow", fillPagesList) : (fillPagesList(), scrollTo(0, b))
        })
    })
}

function initializePageCheck() {
    $(".check_now").live("click", function() {
        var a = $(".last_check_time", findPageRecord(this)),
            b = findUrl(this),
            c = chrome.i18n.getMessage("check_in_progress") + "..";
        a.text(c);
        bgCheckPage(b).then(function() {
            a.trigger("time_updated");
            bgUpdateBadge()
        })
    })
}

function initializePageAdvancedToggler() {
    $(".advanced_toggle input[type=checkbox]").live("click", function() {
        var a = findUrl(this),
            b = findPageRecord(this);
        if ($(this).is(":checked")) {
            $(".advanced_toggle", b).addClass("toggled");
            $(".advanced_controls", b).slideDown("fast");
            var c = $(".page_interval", b);
            0 < $(":checked", c).length && (c = $("input[type=range]", c).val(), c = timeLogToAbsolute(c), setPageCheckInterval(a, c));
            if (0 < $(".mode :checked", b).length) {
                c = $(".mode select", b).val();
                var e = $(".mode_string", b).val();
                setPageRegexOrSelector(a,
                    c, e)
            }
        } else $(".advanced_controls", b).slideUp("fast", function() {
            $(".advanced_toggle", b).removeClass("toggled")
        }), setPageCheckInterval(a, null), setPageRegexOrSelector(a, "regex", null)
    });
    $(".advanced_controls input[type=checkbox]").live("click", function() {
        var a = $(this).is(":checked");
        $(this).nextAll("span").toggleClass("enabled", a).toggleClass("disabled", !a);
        $("input,select", $(this).parent()).not(this).attr({
            disabled: !a
        })
    })
}

function initializePageCheckInterval() {
    $(".page_interval input[type=checkbox]").live("click", function() {
        var a = findUrl(this);
        if ($(this).is(":checked")) {
            var b = $("input[type=range]", $(this).parent()).val();
            b = timeLogToAbsolute(parseFloat(b));
            setPageCheckInterval(a, b)
        } else setPageCheckInterval(a, null)
    });
    $(".page_interval input[type=range]").live("change", async function() {
        var a = 6E4 * timeLogToAbsolute(parseFloat($(this).val()));
        $(this).siblings(".range_value_label").text(await describeTime(a))
    }).live("mouseup", function() {
        var a =
            timeLogToAbsolute(parseFloat($(this).val()));
        setPageCheckInterval(findUrl(this), a)
    })
}

function initializePageModeSelector() {
    $(".mode input[type=checkbox]").live("click", function() {
        var a = findUrl(this),
            b = findPageRecord(this);
        $(this).is(":checked") ? $(".mode_string", b).keyup() : setPageSettings(a, {
            mode: "text",
            regex: null,
            selector: null
        })
    });
    $(".mode select").live("change", function() {
        var a = findPageRecord(this);
        $(".mode_string", a).keyup();
        $(".mode_pick", a).attr({
            disabled: "regex" == $(this).val()
        })
    });
    $(".mode_string").live("keyup", function() {
        var a = $("select", findPageRecord(this)).val();
        setPageRegexOrSelector(findUrl(this),
            a, $(this).val())
    }).live("change", function() {
        $(this).keyup()
    })
}

function initializePageModeTester() {
    var a = $("#test_result_form");
    $(".mode_test").live("click", function() {
        var b = findUrl(this),
            c = findPageRecord(this),
            e = $("select", c).val(),
            d = $(".mode_string", c).val(),
            f = $(this);
        f.val(chrome.i18n.getMessage("test_progress")).add($(".mode_string", c)).attr({
            disabled: !0
        });
        $.ajax({
            url: b,
            dataType: "text",
            success: function(c) {
                ("regex" == e ? findAndFormatRegexMatches : findAndFormatSelectorMatches)(c, d, function(f) {
                    $("textarea", a).val(f);
                    shadeBackground(!0);
                    a.fadeIn();
                    cleanAndHashPage(c,
                        e, d, d,
                        function(a) {
                            setPageSettings(b, {
                                crc: a
                            })
                        })
                })
            },
            error: function() {
                alert(chrome.i18n.getMessage("test_fail"))
            },
            complete: function() {
                f.val(chrome.i18n.getMessage("test_button")).add($(".mode_string", c)).attr({
                    disabled: !1
                })
            }
        })
    });
    $("button", a).click(function() {
        a.fadeOut();
        shadeBackground(!1)
    })
}

function initializePageModePicker() {
    $(".mode_pick").live("click", function() {
        chrome.tabs.create({
            url: findUrl(this),
            selected: !0
        }, function(a) {
            chrome.scripting.executeScript({
                    files: ["lib/jquery-1.7.1.js"],
                    target: {
                        tabId: a.id
                    },
                }, function () {
                    chrome.scripting.executeScript({
                        files: ["scripts/selector.js"],
                        target: {
                            tabId: a.id
                        },
                    }).then(() => {
                        chrome.scripting.executeScript({
                            func: () => initialize(),
                            target: {
                                tabId: a.id
                            },
                        });
                        chrome.scripting.insertCSS({
                            files: ["styles/selector.css"],
                            target: {
                                tabId: a.id
                            }
                        });
                    })
                }
            );
        })
    })
}

function fillPagesList(a) {
    getAllPages(function(b) {
        sortPagesInplace(b, getSetting(SETTINGS.sort_by) || "date added");
        $("#pages").html("");
        0 < b.length ? $.each(b, function(a, b) {
            addPageToTable(b)
        }) : $("#templates .empty").clone().appendTo("#pages");
        (a || $.noop)()
    })
}

function sortPagesInplace(a, b) {
    if ("date added" != b) {
        var c = getSetting(SETTINGS.check_interval);
        a.sort(function(a, d) {
            if ("name" == b) a = a.name, d = d.name;
            else if ("check interval" == b) a = a.check_interval || c, d = d.check_interval || c;
            else if ("last check" == b) a = -a.last_check, d = -d.last_check;
            else if ("last change" == b) a = -a.last_changed || 0, d = -d.last_changed || 0;
            else if ("url" == b) a = a.url, d = d.url;
            else throw Error("Invalid sort order.");
            return a < d ? -1 : 1
        })
    }
}

function addPageToTable(a) {
    var b = $("#templates .page_record").clone(),
        c = getSetting(SETTINGS.check_interval),
        e = a.check_interval || c;
    c = !1;
    var d = a.name || chrome.i18n.getMessage("untitled", a.url);
    60 < d.length && (d = d.replace(/([^]{20,60})(\w)\b.*$/, "$1$2..."));
    b.find(".page_link").attr({
        href: a.url,
        target: "_blank"
    }).text(d);
    b.find(".favicon").attr({
        src: getFavicon(a.url)
    });
    var f = b.find(".last_check_time");
    f.bind("time_updated", function() {
        var b = $(this);
        getPage(a.url, async function(a) {
            var c = a.last_check ? await describeTimeSince(a.last_check) :
                chrome.i18n.getMessage("never");
            c != b.text() && b.fadeOut("slow", function() {
                b.text(c).fadeIn("slow")
            })
        })
    });
    f.trigger("time_updated");
    setInterval(function() {
        f.trigger("time_updated")
    }, 15E3);
    e = timeAbsoluteToLog(e / 6E4);
    var g = $(".page_interval", b);
    $("input[type=range]", g).val(e);
    setTimeout(function() {
        $("input[type=range]", g).change()
    }, 0);
    a.check_interval && (g.children("span").addClass("enabled").removeClass("disabled"), $("input", g).attr({
        disabled: !1
    }), $("input[type=checkbox]", g).attr({
        checked: !0
    }), c = !0);
    null == a.mode && (a.mode = a.regex ? "regex" : "text");
    "text" != a.mode && (c = $(".mode", b), e = "regex" == a.mode ? a.regex : a.selector, c.children("span").addClass("enabled").removeClass("disabled"), $("input,select", c).attr({
        disabled: !1
    }), $("input[type=checkbox]", c).attr({
        checked: !0
    }), $("select", c).val(a.mode).change(), $(".mode_string", c).val(e).keyup(), c = !0);
    c && ($(".advanced_toggle", b).addClass("toggled"), $(".advanced_toggle input", b).attr({
        checked: !0
    }), $(".advanced_controls", b).css({
        display: "block"
    }));
    b.appendTo("#pages")
}

function selectorServer(a, b, c) {
    a && a.selector && (b = findPageRecord(a.url), 0 < b.length && 0 < $(".advanced_toggle.toggled", b).length && 0 < $(".mode :checked", b).length && ($(".mode select", b).val("selector"), $(".mode_string", b).val(a.selector).keyup(), c(null)))
}

function init() {
    getSetting(SETTINGS.animations_disabled) && ($.fx.off = !0);
    applyLocalization();
    $("title").text(chrome.i18n.getMessage("options_title"));
    $(".mode_test").val(chrome.i18n.getMessage("test_button"));
    $(".mode_pick").val(chrome.i18n.getMessage("pick_button"));
    initializeGlobalControls();
    initializePageControls();
    chrome.runtime.onMessage.addListener(selectorServer);
    fillPagesList(function() {
        var a = atob(window.location.hash.substring(1));
        if (a) {
            a = findPageRecord(a);
            var b = $(".advanced_toggle input[type=checkbox]",
                a);
            b.attr("checked", !0);
            b.click();
            b.attr("checked", !0);
            a[0].scrollIntoView()
        }
    })
};

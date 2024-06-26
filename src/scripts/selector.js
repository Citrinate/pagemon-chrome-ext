var OUTLINE_CLASS = "chrome_page_monitor_outline",
    TEMP_OUTLINE_CLASS = "chrome_page_monitor_temp_outline",
    ACTIVE_CLASS = "chrome_page_monitor_active",
    DISABLED_CLASS = "chrome_page_monitor_disabled",
    FRAME_ID = "chrome_page_monitor_selector",
    current_element = null,
    current_selector = "",
    pick_mode = !0,
    frame = null,
    pick_button = null,
    parent_button = null,
    done_button = null,
    help_button = null;

function generateControls() {
    var a = '<div id="' + FRAME_ID + '">   <span title="Pick" class="' + ACTIVE_CLASS + '">%pick%</span>   <span title="Parent" class="' + DISABLED_CLASS + '">%parent%</span>   <input type="button" title="Done" value="%done%" disabled="disabled" />   <input type="button" title="Help" value="%help%" /> </div>',
        c = chrome.i18n.getMessage("selector_gui_pick"),
        b = chrome.i18n.getMessage("selector_gui_parent"),
        d = chrome.i18n.getMessage("selector_gui_done"),
        e = chrome.i18n.getMessage("selector_gui_help");
    a = a.replace("%pick%", c).replace("%parent%", b).replace("%done%", d).replace("%help%", e);
    return $(a)
}

function currentElementChanged() {
    $("*").removeClass(TEMP_OUTLINE_CLASS).removeClass(OUTLINE_CLASS);
    done_button.attr("disabled", !current_element);
    current_element ? ($(current_element).addClass(OUTLINE_CLASS), parent_button.removeClass(DISABLED_CLASS), current_selector = elementToSelector(current_element)) : (parent_button.addClass(DISABLED_CLASS), current_selector = "")
}

function elementToSelector(a) {
    var c = [];
    a = $(a);
    if (a.is("body")) return "body";
    if (0 == a.closest("body").length) return null;
    for (; !a.is("body") && !a.attr("id");) {
        var b = a.get(0).tagName.toLowerCase(),
            d = a.get(0).className;
        b = (d = d.replace(/chrome_page_monitor_\w+/g, "").replace(/^\s+|\s+$/g, "").replace(/\s+/g, ".")) ? b + "." + d : b;
        0 < a.siblings(b).length && (b += ":nth-child(" + (a.index() + 1) + ")");
        c.push(b);
        a = a.parent()
    }
    a.attr("id") ? c.push("#" + a.attr("id")) : c.push("");
    c.reverse();
    return c.join(">")
}

function setUpBodyHandlers() {
    $("body").mousemove(function(a) {
        pick_mode && ($("*").removeClass(TEMP_OUTLINE_CLASS), $(a.target).addClass(TEMP_OUTLINE_CLASS))
    });
    $("body").click(function(a) {
        if (pick_mode) return a = a.target, $(a).is("body") || $(a).closest("#" + FRAME_ID).length || (current_element = a, currentElementChanged(), pick_mode = !1, pick_button.removeClass(ACTIVE_CLASS)), !1
    })
}

function setUpButtonHandlers() {
    pick_button.click(function() {
        pick_mode = !0;
        current_element = null;
        currentElementChanged();
        $(this).addClass(ACTIVE_CLASS)
    });
    parent_button.click(function() {
        if (!$(this).hasClass(DISABLED_CLASS) && current_element) {
            var a = $(current_element).parent();
            a.is("body") ? parent_button.addClass(DISABLED_CLASS) : (current_element = a.get(0), currentElementChanged())
        }
    });
    done_button.click(function() {
        current_selector ? chrome.runtime.sendMessage({
                selector: current_selector,
                url: window.location.href
            },
            window.close) : window.close()
    });
    help_button.click(function() {
        alert(chrome.i18n.getMessage("selector_gui_help_text"))
    })
}

function initialize() {
    generateControls().appendTo("body");
    frame = $("#" + FRAME_ID);
    pick_button = $("span[title=Pick]", frame);
    parent_button = $("span[title=Parent]", frame);
    done_button = $("input[type=button][title=Done]", frame);
    help_button = $("input[type=button][title=Help]", frame);
    setUpButtonHandlers();
    setUpBodyHandlers()
};

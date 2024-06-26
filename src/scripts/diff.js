var SCROLL_MARGIN = 75,
    SHORT_TEXT_LENGTH = 15,
    INS_START = '<ins class="chrome_page_monitor_ins">',
    INS_END = "</ins>",
    DEL_START = '<del class="chrome_page_monitor_del">',
    DEL_END = "</del>";

function getSimilarity(a, b) {
    return (new difflib.SequenceMatcher(a.split(""), b.split(""))).ratio()
}

function tokenizeHtml(a) {
    var b = [];
    $("<html/>").append(a).contents().each(function() {
        this.nodeType == Node.TEXT_NODE ? b = b.concat(this.data.match(/\s+|\w+|\W+/g)) : this.nodeType == Node.ELEMENT_NODE && b.push(this.outerHTML)
    });
    return b
}

function hashToken(a, b) {
    return /^</.test(a) ? crc(b ? cleanHtmlPage(a) : a) : a
}

function hasTags(a) {
    for (var b = 0; b < a.length; b++)
        if ("number" == typeof a[b]) return !0;
    return !1
}

function eachOpcode(a, b) {
    for (var c = 0; c < a.length; c++) {
        var d = a[c];
        b(d, d[1], d[2], d[3], d[4])
    }
}

function alignTagRuns(a, b, c, d, f) {
    function h(a, d, f, h, k) {
        if (a != d || f != h) {
            var e = a == d ? "insert" : f == h ? "delete" : "replace";
            if ("replace" == e) {
                var n = b.slice(a, d).join(""),
                    m = c.slice(f, h).join("");
                n == m && (e = "equal")
            }
            k && "replace" == e ? (g.push(["delete", a, d, 0, 0]), g.push(["insert", 0, 0, f, h])) : g.push([e, a, d, f, h])
        }
    }
    var g = [];
    eachOpcode(a, function(a, n, p, q, k) {
        if ("replace" != a[0]) g.push(a);
        else {
            var e = hasTags(d.slice(n, p));
            a = hasTags(f.slice(q, k));
            if (e || a) {
                var l = n,
                    m = p;
                if (e)
                    for (e = n; e < p && !b[e].match(/^</); e++) l++;
                for (e = p - 1; e >= n &&
                    !b[e].match(/^</); e--) m--;
                var r = q,
                    t = k;
                if (a)
                    for (e = q; e < k && !c[e].match(/^</); e++) r++;
                for (e = k - 1; e >= q && !c[e].match(/^</); e--) t--;
                h(n, l, q, r, !0);
                h(l, m, r, t);
                h(m, p, t, k, !0)
            } else h(n, p, q, k, !0)
        }
    });
    return g
}

function recurseHtmlDiff(a, b, c, d, f, h) {
    var g = [];
    eachOpcode(a, function(a, n, p, q, k) {
        if ("replace" != a[0]) g.push(a);
        else {
            a = null;
            var e = p - n,
                l = k - q;
            if (e != l) {
                e = Math.min(e, l);
                l = getSimilarity(b[n], c[q]);
                var m = getSimilarity(b[p - 1], c[k - 1]);
                l > m ? (l = n + e, e = q + e, p != l ? a = ["delete", l, p, 0, 0] : k != e && (a = ["insert", 0, 0, e, k]), p = l) : (l = p - e, k -= e, n != l ? g.push(["delete", n, l, 0, 0]) : q != k && g.push(["insert", 0, 0, q, k]), n = l, q = k)
            }
            for (k = 0; k < p - n; k++) {
                e = n + k;
                l = q + k;
                m = b[e].match(/^<(\w+)[^>]*>/);
                var r = c[l].match(/^<(\w+)[^>]*>/);
                m && r && m[0] == r[0] ? (m = [r[0], calculateHtmlDiff($(b[e]).html(), $(c[l]).html(), h), "</" + r[1] + ">"].join(""), r = hashToken(m, h), b[e] = c[l] = m, d[e] = f[l] = r, g.push(["equal", e, e + 1, l, l + 1])) : (g.push(["delete", e, e + 1, 0, 0]), g.push(["insert", 0, 0, l, l + 1]))
            }
            a && g.push(a)
        }
    });
    return g
}

function clusterRuns(a, b, c, d, f) {
    var h = [],
        g = [],
        m = [];
    eachOpcode(a, function(a, p, q, k, e) {
        var l = hasTags(d.slice(p, q)),
            n = hasTags(f.slice(k, e));
        switch (a[0]) {
            case "delete":
                g.push(a);
                break;
            case "insert":
                m.push(a);
                break;
            case "equal":
                if ((g.length || m.length) && !l && !n && b.slice(p, q).join("").length < SHORT_TEXT_LENGTH && c.slice(k, e).join("").length < SHORT_TEXT_LENGTH) {
                    g.push(["delete", p, q, k, e]);
                    m.push(["insert", p, q, k, e]);
                    break
                }
            case "replace":
                h = h.concat(g), h = h.concat(m), g = [], m = [], h.push(a)
        }
    });
    h = h.concat(g);
    return h = h.concat(m)
}

function assembleHtmlDiff(a, b, c) {
    var d = [],
        f = "equal";
    eachOpcode(a, function(a, g, m, n, p) {
        "equal" != f && f != a[0] && d.push("delete" == f ? DEL_END : INS_END);
        switch (a[0]) {
            case "delete":
                g != m && ("delete" != f && d.push(DEL_START), d = d.concat(b.slice(g, m)));
                break;
            case "insert":
                n != p && ("insert" != f && d.push(INS_START), d = d.concat(c.slice(n, p)));
                break;
            case "equal":
                d = d.concat(c.slice(n, p));
                break;
            default:
                return console.assert(!1), null
        }
        f = a[0]
    });
    "delete" == f ? d.push(DEL_END) : "insert" == f && d.push(INS_END);
    return d
}

function internalizeTableDiffs(a) {
    for (var b = [], c = 0; c < a.length; c++) {
        var d = a[c];
        switch (d) {
            case INS_START:
                b.push(INS_START);
                break;
            case DEL_START:
                b.push(DEL_START);
                break;
            case INS_END:
                console.assert(b.pop() == INS_START);
                break;
            case DEL_END:
                console.assert(b.pop() == DEL_START);
                break;
            default:
                var f = d.match(/^<(td|tr)\b/);
                b.length && f && (d = $(d), ("tr" == f[1] ? $("td", d) : d).wrapInner(b[b.length - 1]), a[c] = d.get(0).outerHTML)
        }
    }
    console.assert(0 == b.length)
}

function calculateHtmlDiff(a, b, c) {
    function d(a) {
        return a.map(function(a) {
            return hashToken(a, c)
        })
    }
    a = tokenizeHtml(a);
    b = tokenizeHtml(b);
    var f = d(a),
        h = d(b),
        g = (new difflib.SequenceMatcher(f, h)).get_opcodes();
    g = alignTagRuns(g, a, b, f, h);
    g = recurseHtmlDiff(g, a, b, f, h, c);
    f = clusterRuns(g, a, b, f, h);
    a = assembleHtmlDiff(f, a, b);
    internalizeTableDiffs(a);
    return a.join("")
}

function calculateTextDiff(a, b) {
    var c = new diff_match_patch,
        d = c.diff_main(a, b);
    c.diff_cleanupSemantic(d);
    c = [];
    c.push("<pre>");
    for (var f = 0; f < d.length; f++) {
        var h = d[f][0],
            g = d[f][1].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r\n|\r|\n/g, "<br />");
        switch (h) {
            case DIFF_DELETE:
                c.push(DEL_START);
                c.push(g);
                c.push(DEL_END);
                break;
            case DIFF_INSERT:
                c.push(INS_START);
                c.push(g);
                c.push(INS_END);
                break;
            case DIFF_EQUAL:
                c.push(g);
                break;
            default:
                return console.assert(!1), null
        }
    }
    c.push("</pre>");
    return c.join("")
}

function generateControls(a) {
    var b = !getSetting(SETTINGS.hide_deletions),
        c = chrome.i18n.getMessage("diff_original_title"),
        d = chrome.i18n.getMessage("diff_original"),
        f = chrome.i18n.getMessage("diff_textize"),
        h = chrome.i18n.getMessage("diff_untextize"),
        g = chrome.i18n.getMessage("diff_hide_deletions"),
        m = chrome.i18n.getMessage("diff_show_deletions");
    a = '<div id="chrome_page_monitor_ext_orig_link">   <a class="pm_original" href="%url%"      title="%title%">%original%</a>   <br />   <a class="pm_textize" href="#">%textize%</a>   <br />   <a class="pm_hide" href="#">%hide%</a> </div>'.replace("%url%", a).replace("%title%",
        c).replace("%original%", d).replace("%textize%", f).replace("%hide%", b ? g : m);
    a = $(a);
    b || $("del").hide();
    $(".pm_hide", a).click(function() {
        $(this).text(b ? g : m);
        $("del").toggle(b = !b);
        return !1
    });
    var n = $('link[rel="stylesheet"]:not([href="styles/diff.css"]),style'),
        p = $('<link rel="stylesheet" type="text/css" href="diff_txt.css"/>'),
        q = $("body *[style]").each(function() {
            $(this).data("style", $(this).attr("style"))
        }),
        k = $("img:visible,object:visible,applet:visible,video:visible"),
        e = !1;
    $(".pm_textize", a).click(function() {
        $(this).text($(this).text() ==
            h ? f : h);
        e ? (n.appendTo("head"), p.detach(), q.each(function() {
            $(this).attr("style", $(this).data("style"))
        }), k.show()) : (n.detach(), p.appendTo("head"), q.each(function() {
            $(this).attr("style", "")
        }), k.hide());
        e = !e;
        return !1
    });
    return a
}

function calculateBaseUrl(a, b, c) {
    b = b.match(/<base[^>]*href=['"]?([^>'"]+)[^>]*>/i);
    c = c.match(/<base[^>]*href=['"]?([^>'"]+)[^>]*>/i);
    b && 0 < b.length ? a = b[b.length - 1] : c && 0 < c.length && (a = c[c.length - 1]);
    return a
}

function getInlineStyles(a) {
    a = a.match(/<style[^>]*>(.*?)<\/style>/ig);
    var b = [];
    if (a)
        for (var c = 0; c < a.length; c++) b.push(a[c].replace(/<\/?style[^>]*>/ig, ""));
    return b.join("\n")
}

function getReferencedStyles(a) {
    return (a = a.match(/<link[^>]*>/ig)) ? $(a.join("")).filter('[rel="stylesheet"]') : $([])
}

function findFirstChangePosition() {
    var a = Infinity,
        b = Infinity;
    $("ins,del").each(function() {
        if (!/^\s*$/.test($(this).text())) {
            var c = $(this).offset();
            c.top < a && (a = c.top);
            c.left < b && (b = c.left)
        }
    });
    Infinity == b && (b = 0);
    Infinity == a && (a = 0);
    return {
        left: b,
        top: a
    }
}

function applyDiff(a, b, c, d, f) {
    $("<base />").attr("href", calculateBaseUrl(a, b, c)).appendTo("head");
    var h = c.replace(/\x3c!--.*?--\x3e/g, "");
    $('<style type="text/css">').text(getInlineStyles(h)).appendTo("head");
    getReferencedStyles(h).appendTo("head");
    b = (d.match(/\b(x|xht|ht)ml\b/) ? calculateHtmlDiff : calculateTextDiff)(getStrippedBody(b), getStrippedBody(c), f);
    null === b && alert(chrome.i18n.getMessage("diff_error"));
    $("body").html(b);
    generateControls(a).appendTo("body");
    setTimeout(function() {
        var a = findFirstChangePosition();
        window.scrollTo(a.left, a.top - SCROLL_MARGIN)
    }, 10)
}

function initiateDiff(a) {
    getPage(a, function(b) {
        $.ajax({
            url: a,
            dataType: "text",
            success: function(c, d, f) {
                d = f.getResponseHeader("Content-type");
                b.html ? (f = "text" == b.mode, applyDiff(a, b.html, canonizePage(c, d), d, f), "selector" == b.mode && b.selector && !getSetting(SETTINGS.show_full_page_diff) && ($("del,ins", b.selector).addClass("preserve"), $(b.selector).each(function() {
                        var a = $(this).parent();
                        a.is("del,ins") && a.addClass("preserve")
                    }), $("del:not(.preserve)").remove(), $("ins:not(.preserve)").each(function() {
                        $(this).replaceWith($(this).contents())
                    }))) :
                    (setPageSettings(a, {
                        html: c
                    }), $("img").hide(), $("div:first").html(chrome.i18n.getMessage("diff_corruption")))
            }
        })
    })
};

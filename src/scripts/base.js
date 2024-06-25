var SETTINGS = {
  check_interval: "check_interval",
  badge_color: "badge_color",
  version: "version",
  sound_alert: "sound_alert",
  notifications_enabled: "notifications_enabled",
  notifications_timeout: "notifications_timeout",
  animations_disabled: "animations_disabled",
  sort_by: "sort_by",
  custom_sounds: "custom_sounds",
  view_all_action: "view_all_action",
  hide_deletions: "hide_deletions",
  show_full_page_diff: "show_full_page_diff"
},
BG = false,
REGEX_TIMEOUT = 7E3,
REGEX_WORKER_PATH = "scripts/regex.js",
REQUEST_TIMEOUT = 1E4,
MIN_BODY_TAIL_LENGTH = 100,
DATABASE_STRUCTURE = "CREATE TABLE IF NOT EXISTS pages (   `url` TEXT NOT NULL UNIQUE,   `name` TEXT NOT NULL,   `mode` TEXT NOT NULL DEFAULT 'text',   `regex` TEXT,   `selector` TEXT,   `check_interval` INTEGER,   `html` TEXT NOT NULL DEFAULT '',   `crc` INTEGER NOT NULL DEFAULT 0,   `updated` INTEGER,   `last_check` INTEGER,   `last_changed` INTEGER );";

class SQLiteDatabaseService {
  promiser;

  constructor() {
    this.promiser = new Promise((resolve) => {
      const _promiser = sqlite3Worker1Promiser({
        onready: () => {
          resolve(_promiser);
        },
      });
    })
  }

  getDbId = async () => {
    const { dbId } = (await this.promiser)('open', {
      filename: 'file:worker-promiser.sqlite3?vfs=opfs',
    });

    return dbId
  }

  executeSql = async (sql, args, callback) => {
    const dbId = await this.getDbId();
    const rows = [];

    try {
      return (await this.promiser)('exec', {
        bind: args,
        dbId,
        returnValue: 'resultRows',
        rowMode: 'object',
        sql,
        callback({ row, columnNames, rowId }) {
          if (!row) {
            if (typeof callback === "function") {
              callback(rows);
            }
            return;
          }

          rows.push(row);
        }
      });
    } catch (error) {
      if (!(err instanceof Error)) {
        err = new Error(err.result.message);
      }
      console.error(err.name, err.message, sql, args);
    } finally {
      (await this.promiser)('close', { dbId });
    }
  }
}

const SQLITE_DB = new SQLiteDatabaseService();

(function() {
var a = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101,
  3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271,
  366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376,
  3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954,
  1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836,
  1088359270, 936918E3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117
];
crc = function(b) {
  if ("string" != typeof b) return null;
  b = encodeUTF8(b);
  for (var d = b.length, c = 4294967295, e = 0; e < d; e++) c = c >>> 8 ^ a[c & 255 ^ b.charCodeAt(e)];
  return c ^ -1
}
})();

function encodeUTF8(a) {
for (var b = [], d = 0; d < a.length; d++) {
  var c = a.charCodeAt(d);
  128 > c ? b.push(String.fromCharCode(c)) : (127 < c && 2048 > c ? b.push(String.fromCharCode(c >> 6 | 192)) : (b.push(String.fromCharCode(c >> 12 | 224)), b.push(String.fromCharCode(c >> 6 & 63 | 128))), b.push(String.fromCharCode(c & 63 | 128)))
}
return b.join("")
}

async function describeTime(a) {
var b = Math.floor(a / 1E3),
  d = Math.floor(b / 60) % 60,
  c = Math.floor(b / 3600) % 24,
  e = Math.floor(b / 86400),
  f = "";
if (e) {
  var g = await i18nGetMessage("day");
  a = await i18nGetMessage("days", e.toString());
  f += 1 == e ? g : a
}
c && (g = await i18nGetMessage("hour"), a = await i18nGetMessage("hours", c.toString()), f += " " + (1 == c ? g : a));
!e && d && (g = await i18nGetMessage("minute"), a = await i18nGetMessage("minutes", d.toString()), f += " " + (1 == d ? g : a));
f || (g = await i18nGetMessage("second"), a = await i18nGetMessage("seconds",
  b.toString()), f += " " + (1 == b ? g : a));
return f.replace(/^\s+|\s+$/g, "")
}

async function describeTimeSince(a) {
return await i18nGetMessage("ago", await describeTime(Date.now() - a))
}

function getStrippedBody(a) {
var b = a.match(/<body[^>]*>(?:([^]*)<\/body>([^]*)|([^]*))/i);
b = b && 1 < b.length ? b[2] && b[2].length > MIN_BODY_TAIL_LENGTH ? b[1] + " " + b[2] : void 0 === b[1] ? b[3] : b[1] : a;
return b.replace(/<script\b[^>]*(?:>[^]*?<\/script>|\/>)/ig, "<blink/>")
}

function getFavicon(a) {
return chrome.runtime.getURL("/_favicon/?pageUrl=") + a;
}

function applyLocalization() {
$(".i18n[title]").each(async function() {
  $(this).removeClass("i18n").text(await i18nGetMessage($(this).attr("title"))).attr("title", "")
})
}

function getSetting(a) {
return JSON.parse(localStorage.getItem(a) || "null")
}

function setSetting(a, b) {
localStorage.setItem(a, JSON.stringify(b))
}

function delSetting(a) {
localStorage.removeItem(a)
}

function initializeStorage(a) {
executeSql(DATABASE_STRUCTURE, [], a)
}

function executeSql(a, b, d, c) {
  SQLITE_DB.executeSql(a, b, d);
}

function sqlResultToArray(a) {
  return a;
}

function getPage(a, b) {
b && executeSql("SELECT * FROM pages WHERE url = ?", [a], function(a) {
  console.assert(1 >= a.length);
  a.length ? (a = a[0], a.check_interval || (a.check_interval = getSetting(SETTINGS.check_interval)), b(a)) : b(null)
})
}

function getAllPageURLs(a) {
a && executeSql("SELECT url FROM pages", [], function(b) {
  for (var d = [], c = 0; c < b.length; c++) d.push(b[c].url);
  a(d)
})
}

function getAllPages(a) {
a && executeSql("SELECT * FROM pages", [], function(b) {
  a(sqlResultToArray(b))
})
}

function getAllUpdatedPages(a) {
a && executeSql("SELECT * FROM pages WHERE updated = 1", [], function(b) {
  a(sqlResultToArray(b))
})
}

function setPageSettings(a, b, d) {
var c = [],
  e = [],
  f;
for (f in b) c.push(f + " = ?"), "boolean" == typeof b[f] && (b[f] = Number(b[f])), e.push(b[f]);
e.push(a);
c ? (a = "UPDATE pages SET " + c.join(", ") + " WHERE url = ?", executeSql(a, e, d)) : (d || $.noop)()
}

async function addPage(a, b) {
if (!BG) return bgAddPage(a, b);
executeSql("REPLACE INTO pages(url, name, mode, regex, selector,                    check_interval, html, crc, updated,                    last_check, last_changed) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
[a.url, a.name || await i18nGetMessage("untitled", a.url), a.mode || "text", a.regex || null, a.selector || null, a.check_interval || null, a.html || "", a.crc || 0, a.updated ? 1 : 0, Date.now(), a.last_changed || null]
, function() {
  bgTakeSnapshot();
  bgScheduleCheck();
  (b || $.noop)()
})
}

function removePage(a, b) {
executeSql("DELETE FROM pages WHERE url = ?", [a], function() {
  bgScheduleCheck();
  (b || $.noop)()
})
}

function isPageMonitored(a, b) {
executeSql("SELECT COUNT(*) FROM pages WHERE url = ?", [a], function(a) {
  a = a[0]["COUNT(*)"];
  console.assert(1 >= a);
  (b || $.noop)(1 == a)
})
}

function canonizePage(a, b) {
return a ? b.match(/\b(x|xht|ht)ml\b/) ? a.replace(/\s+/g, " ") : a : a
}

function findAndFormatRegexMatches(a, b, d) {
function c(a) {
  e || (e = !0, f.terminate(), (d || $.noop)(a ? a.data : null))
}
if (d) {
  if (!b) return d("");
  var e = !1,
      f = new Worker(REGEX_WORKER_PATH);
  f.onmessage = c;
  f.postMessage(JSON.stringify({
      command: "run",
      text: a,
      regex: b
  }));
  setTimeout(c, REGEX_TIMEOUT)
}
}

function findAndFormatSelectorMatches(a, b, d) {
try {
  var c = $("<body>").html(getStrippedBody(a)),
      e = $(b, c).map(function() {
          return '"' + $("<div>").append(this).html() + '"'
      }).get().join("\n");
  (d || $.noop)(e)
} catch (f) {
  (d || $.noop)(null)
}
}

function cleanHtmlPage(a, b) {
a = a.toLowerCase();
a = getStrippedBody(a);
a = a.replace(/<(script|style|object|embed|applet)[^>]*>[^]*?<\/\1>/g, "");
a = a.replace(/<img[^>]*src\s*=\s*['"]?([^<>"' ]+)['"]?[^>]*>/g, "{startimg:$1:endimg}");
a = a.replace(/<[^>]*>/g, "");
a = a.replace(/\s+/g, " ");
a = $("<div/>").html(a).text();
a = a.replace(/\d+ ?(st|nd|rd|th|am|pm|seconds?|minutes?|hours?|days?|weeks?|months?)\b/g, "");
a = a.replace(/[\x00-\x40\x5B-\x60\x7B-\xBF]/g, "");
if (b) b(a);
else return a
}

function cleanAndHashPage(a, b, d, c, e) {
function f(a) {
  e(crc(a || ""))
}
e && ("regex" == b && d ? findAndFormatRegexMatches(a, d, f) : "selector" == b && c ? findAndFormatSelectorMatches(a, c, f) : cleanHtmlPage(a, f))
}

function checkPage(a, b, d) {
getPage(a, function(c) {
  !c || c.updated ? (b || $.noop)(a) : $.ajax({
      url: a,
      dataType: "text",
      timeout: c.check_interval / 2,
      success: function(e, f, g) {
          var h = g.getResponseHeader("Content-type");
          cleanAndHashPage(e, c.mode, c.regex, c.selector, function(f) {
              var g = {};
              g = f != c.crc ? {
                  updated: !0,
                  crc: f,
                  html: d ? canonizePage(e, h) : c.html,
                  last_changed: Date.now()
              } : {
                  html: canonizePage(e, h)
              };
              g.last_check = Date.now();
              setPageSettings(a, g, function() {
                  (b || $.noop)(a)
              })
          })
      },
      error: function() {
          setPageSettings(a, {
                  last_check: Date.now()
              },
              function() {
                  (b || $.noop)(a)
              })
      }
  })
})
}

function takeSnapshot(a, b) {
checkPage(a, function() {
  setPageSettings(a, {
      updated: !1
  }, b)
}, !0)
}
$.ajaxSetup({
timeout: REQUEST_TIMEOUT,
headers: {
  "Cache-Control": "no-cache",
  Etag: "bad-etag"
}
});

async function i18nGetMessage(...params) {
  if (chrome.i18n && chrome.i18n.getMessage) {
    return chrome.i18n.getMessage(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "i18n.getMessage", params: params});
  }
}

async function extensionGetViews(...params) {
  if (chrome.extension && chrome.extension.getViews) {
    return chrome.extension.getViews(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "extension.getViews", params: params});
  }
}

async function notificationsCreate(...params) {
  if (chrome.notifications && chrome.notifications.create) {
    return chrome.notifications.create(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "notifications.create", params: params});
  }
}

async function notificationsClear(...params) {
  if (chrome.notifications && chrome.notifications.clear) {
    return chrome.notifications.clear(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "notifications.clear", params: params});
  }
}

async function actionSetBadgeBackgroundColor(...params) {
  if (chrome.action && chrome.action.setBadgeBackgroundColor) {
    return chrome.action.setBadgeBackgroundColor(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "action.setBadgeBackgroundColor", params: params});
  }
}

async function actionSetBadgeText(...params) {
  if (chrome.action && chrome.action.setBadgeText) {
    return chrome.action.setBadgeText(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "action.setBadgeText", params: params});
  }
}

async function actionSetIcon(...params) {
  if (chrome.action && chrome.action.setIcon) {
    return chrome.action.setIcon(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "action.setIcon", params: params});
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      // console.log("message recieved at base.js", request);

      if (!BG) {
        return;
      }

      switch (request.type) {
          case "bgAddPage":
            sendResponse(bgAddPage(...request.params));
            break;

          case "bgRemovePage":
            sendResponse(bgRemovePage(...request.params));
            break;

          case "bgTakeSnapshot":
            sendResponse(bgTakeSnapshot(...request.params));
            break;

          case "bgScheduleCheck":
            sendResponse(bgScheduleCheck(...request.params));
            break;

          case "bgSetPageSettings":
            sendResponse(bgSetPageSettings(...request.params));
            break;

          case "bgUpdateBadge":
            sendResponse(bgUpdateBadge(...request.params));
            break;

          case "bgGetAllUpdatedPages":
            sendResponse(bgGetAllUpdatedPages(...request.params));
            break;

          case "bgCheck":
            sendResponse(bgCheck(...request.params));
            break;

          case "bgCheckPage":
            sendResponse(bgCheckPage(...request.params));
            break;

          case "bgHideDesktopNotification":
            sendResponse(bgHideDesktopNotification(...request.params));
            break;

          case "bgNotificationClicked":
            sendResponse(bgNotificationClicked(...request.params));
            break;

          default:
            break;
      }
  }
);

async function bgAddPage(...params) {
    if (BG) {
      return addPage(...params);
    } else {
      return await chrome.runtime.sendMessage({type: "bgAddPage", params: params});
    }
}

async function bgRemovePage(...params) {
  if (BG) {
    return removePage(...params); 
  } else {
    return await chrome.runtime.sendMessage({type: "bgRemovePage", params: params});
  }
}

async function bgTakeSnapshot(...params) {
  if (BG) {
    return takeSnapshot(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgTakeSnapshot", params: params});
  }
}

async function bgScheduleCheck(...params) {
  if (BG) {
    return scheduleCheck(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgScheduleCheck", params: params});
  }
}

async function bgSetPageSettings(...params) {
  if (BG) {
    return setPageSettings(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgSetPageSettings", params: params});
  }
}

async function bgUpdateBadge(...params) {
  if (BG) {
    return updateBadge(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgUpdateBadge", params: params});
  }
}

async function bgGetAllUpdatedPages(...params) {
  if (BG) {
    return getAllUpdatedPages(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgGetAllUpdatedPages", params: params});
  }
}

async function bgCheck(...params) {
  if (BG) {
    return check(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgCheck", params: params});
  }
}

async function bgCheckPage(...params) {
  if (BG) {
    return checkPage(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgCheckPage", params: params});
  }
}

async function bgHideDesktopNotification(...params) {
  if (BG) {
    return hideDesktopNotification(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgHideDesktopNotification", params: params});
  }
}

async function bgNotificationClicked(...params) {
  if (BG) {
    return notificationClicked(...params);
  } else {
    return await chrome.runtime.sendMessage({type: "bgNotificationClicked", params: params});
  }
}

$(function() {
    bgHideDesktopNotification();
    getSetting(SETTINGS.animations_disabled) && ($.fx.off = !0);
    applyLocalization();
    setUpHandlers();
    fillNotifications()
});

function BasePage(launcher) {
    if (arguments.length == 0) return;

    var basePage = this;
    
    $(launcher).on("ajaxLoaded", function (e) {
        basePage.LoadPage();
    });

    $(document).on("ajaxUnload", function (e) {
        basePage.DestroyPage();
        $(document).off("ajaxUnload");
    });
}

BasePage.prototype.DestroyPage = function() {
};
BasePage.prototype.LoadPage = function () {
};
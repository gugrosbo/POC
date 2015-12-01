document.ready = initAll;
var initialized = false;
function initAll() {
    if (initialized) {
        return;
    }

    initialized = true;
    if ($.browser.msie && $.browser.version.substr(0, 2) < 10) {
        MobyAlert("<h1>Please use Microsoft Internet Explorer 10 or greater</h1> The site will not be displayed correctly with lower versions");
    }

    $("#content").fadeTo(0, 0);

    initMaster();

    var hostPage = new HostsPage("#mobyDockMenuLink");

    initAjax();
    loadPageFromHash("");

    $("#content").fadeTo(400, 1);
    window.transitionEndEvent = whichTransitionEvent();
    $(document).on(transitionEndEvent, function (e) { $(e.target).off(transitionEndEvent) });
}

function initMaster() {
    $(document).on("click", "a.ajaxFormLink", function (e) {
        var that = $(this);
        var href = $(this).attr("href");
        $.colorbox({
            href: href,
            width: "1000px", height: "650px",
            onComplete: function () {
                that.trigger("onColorBoxFormComplete", "#cboxLoadedContent form");
            }
        });
        stopBubble(e);
        return false;
    });

    $(window).resize(resize);
    resize();
}

function stopBubble(e) {
    if (e && e.stopImmediatePropagation) {
        e.stopImmediatePropagation();
    }
    else {
        window.event.cancelBubble = true;
    }
}

function resize() {
    $("#content").height($("#page").height() - $("header").outerHeight() - $("innerHeader").outerHeight() - 150).css({ "overflow-x": "hidden", "overflow-y": "auto" });
}



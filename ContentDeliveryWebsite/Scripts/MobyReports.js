
function initReports(launcher) {


    $(launcher).on("ajaxLoaded", function (e) {
        loadReports();
        setReportsEvents();
    });

    $(document).on("ajaxUnload", function (e) {
        //unsetReportsEvents();
        //$(document).off("ajaxUnload");
    });

}
function setReportsEvents() {
    $(".reportTree").on("click", "h2,h3", function () {
        var li = $(this).next();
        if (li.is(':visible')) {
            li.hide();
        } else {
            li.find("table").each(function () {
                if (!$(this).hasClass("MobyTable")) {
                    $(this).MobyTable({ searchInput: $(this).closest("fieldset").children("input.search") });
                }
                
            });
            li.show();
            var container = $(this).closest(".Yscrollable");
            if (li.height() > (container.offset().top + container.height() - $(this).offset().top)) {
                $(this).closest(".Yscrollable").animate({
                    scrollTop: Math.min(container.scrollTop() + ($(this).offset().top - container.offset().top), container.scrollTop() + li.height() + 40)
                }, 400);
            }

        }

    });




    $("a#analysisLink").on("click", function () {
        return false;
    });

}
function unsetReportsEvents() {
    $("a#analysisLink").off("click");
}
function loadReports() {
    
    var form = $("#content>form");
    $(".reportTree>li ul, .reportTree>li table").hide();

    $("h2,h3").each(function() {
        if ($(this).next().find(".errorRow").size() == 0) {
            $(this).addClass("passedRow");
        } else if ($(this).next().find(".passedRow").size() == 0) {
            $(this).addClass("errorRow");
        } else {
            $(this).addClass("errorAndPassedRow");
        }
    });

    var clickedOnce = false;
    $("#content form").MobyFormTab({
        height: form.parent().height(),
        width: form.width(),
        onTabClick: function (e, tabClicked, data) {
            if (data == null || data.triggeredByUser) {
                var state;
                if (!clickedOnce) {
                    state = {
                        type: "event",
                        url: currentlyLoaded,
                        pageLinkSelector: "#" + $("#tabs").find("a.active").attr("id"),
                        selector: "#" + form.children(".active").children(".fieldsetBookmark").uniqueId().attr("id"),
                        eventString: "click"
                    };
                    history.pushState(state, document.title, window.location);
                    clickedOnce = true;
                }
                state = {
                    type: "event",
                    url: currentlyLoaded,
                    pageLinkSelector: "#" + $("#tabs").find("a.active").attr("id"),
                    selector: "#" + tabClicked.uniqueId().attr("id"),
                    eventString: "click"
                };
                history.pushState(state, document.title, window.location);
            }

        }
    });
    $(".fieldsetWrapper fieldset").prepend('<input type="text" class="search sprited" spellcheck="false" />');
    /**/
}
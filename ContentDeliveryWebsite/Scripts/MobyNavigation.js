
function loadPageFromHash(hash) {
    hash = hash.substring(1);
    var currentPage = $("head").children("meta[name='currentUrl']").attr("content").substr(1);

    var page, events, url, queryString;
    if (hash.indexOf("#") != -1) {
        page = hash.substring(0, hash.indexOf("#"));
        events = hash.substring(hash.indexOf("#") + 1);
    } else {
        page = hash;
        events = "";
    }

    if (page.indexOf("?") != -1) {
        url = page.substring(0, page.indexOf("?"));
        var branchId = page.substring(page.indexOf("?") + 1);
        $("#branchSelection").val(branchId);
    }

    if (page != currentPage) {
        var link = $("a[href='" + url + "']");
        var data = {};
        data.onComplete = function () {
            triggerEvents(events);
        }
        link.trigger("click", data);
    } else {
        triggerEvents(events);
    }

    function triggerEvents(evtString) {
        if (evtString == null || evtString == "")
            return;
        var eventList = evtString.split("/");
        eventList.forEach(function (el) {
            var pairs = el.split("&");
            var selector = decodeURIComponent(pairs[0]);
            var eventString = decodeURIComponent(pairs[1]);
            pairs.shift();
            pairs.shift();
            var evtArgs = pairs;

            $(selector).trigger(eventString, evtArgs);
        });
    }

}

function initAjax() {
    $(window).bind("popstate", function (evt) {
        var originalState = evt.originalEvent.state;
        loadPageFromHash(document.location.hash);
    });
    
    $.ajaxSetup({
        cache: false,
        beforeSend: function () {
            $(document).css("cursor", "wait");
        },
        complete: function () {
            $(document).css("cursor", "default");
        },
        error: function (xhr, status, error) {
            $.colorbox.close();
            $(document).css("cursor", "default");
            console.dir(xhr);
            MobyAlert("An AJAX error occured: " + status + "<br />Error: " + error + "<br />Xhr: " + xhr.responseText, { level: "error" });
        }
    });

    $(document).bind("ajaxLoad", function (e, orig, url, getData, onComplete) {
        var data;

        var load = $.get(url, getData, function (d) {
            data = d;
        });
        var hide = $("#content, #PageTitle, #menuBar").animate({ opacity: 0 }, 400);

        var content = $("#content");
        var top = $("#page").height() / 2 - 150;
        var left = $("#page").width() / 2 - 50 + 25;
        $("#page").prepend('<div class="loaderAnim" style="top:' + top + 'px; left:' + left + 'px"></div>');
        

        $.when(hide, load).done(function () {
            $(window).off("resize");
            $(window).resize(resize);
            $(document).trigger("ajaxUnload", url);

            var section = $(data).filter("section");
            $("#content").empty().html(section.html()).attr("class", section.attr("class"));
            $("#PageTitle").empty().html($(data).filter("title").html());
            $("#menuBar").empty().html($(data).filter("header").html());
            orig.trigger("ajaxLoaded", url);

            resize();
            $.when($("#content, #PageTitle, #menuBar").animate({ opacity: 1 }, 400)).done(function () {
                $(".loaderAnim").remove();
                orig.trigger("ajaxComplete", url);
                onComplete();
            });
        });
    });

    $(".ajaxLink").on("click", function (e, data) {
        var that = $(this);
        if (isHuman(e) && that.hasClass('active')) return false;

        var href = that.attr("href") === "/" ? "Home" : that.attr("href");
        var url = "#" + href;
        var branchId = $("#branchSelection").val();
        var urlToBeLoaded = href + "/Index/1";
        $(document).trigger("ajaxLoad", [that, urlToBeLoaded, { branchId: branchId }, function () {
            that.closest("ul").find(".active").removeClass("active");
            that.closest("li").addClass("active");
            that.addClass("active");

            if (isHuman(e) || (data != undefined && data.addToHistory)) {
                var activeFieldSetWrapper = $(".fieldsetWrapper.active");
                var histUrl = url + "?" + branchId;
                $("head>meta[name='currentUrl']").attr("content", url);
                if (activeFieldSetWrapper.size() > 0) {
                    var selector = encodeURIComponent(getSelector(activeFieldSetWrapper.closest("form").find(".fieldsetBookmark:eq(" + (activeFieldSetWrapper.index()-1)+")")));
                    histUrl = histUrl + "#" + selector + "&click";
                }
                history.pushState(null, document.title, histUrl);
            }

            if (data !== undefined && data.onComplete !== undefined)
                data.onComplete();
        }]);
        return false;
    });
}

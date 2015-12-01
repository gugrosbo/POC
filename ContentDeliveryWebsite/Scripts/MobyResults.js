
function initResults(launcher) {


    $(launcher).on("ajaxLoaded", function (e) {
        loadResults();
        setResultsEvents();
    });

    $(document).on("ajaxUnload", function (e) {
        unsetResultsEvents();
        $(document).off("ajaxUnload");
    });

}
function setResultsEvents() {
   /*$(".resultTree").on("click", "h2,h3", function () {
        var li = $(this).next();
        if (li.is(':visible')) {
            li.hide();
        } else {
            li.show();
            var container = $(this).closest(".Yscrollable");
            if (li.height() > (container.offset().top + container.height() - $(this).offset().top)) {
                $(this).closest(".Yscrollable").animate({
                    scrollTop: Math.min(container.scrollTop() + ($(this).offset().top - container.offset().top), container.scrollTop() + li.height() + 40)
                }, 400);
            }
        }
    });

    $(".resultTree").on("setState", "li>ul>li>.checkbox", function (e, state) {
        if (state == "all") {
            $(this).parent().children("table").find(".checkbox").trigger("determineState", "all");
        } else if (state == "") {
            $(this).parent().children("table").find(".checkbox").trigger("determineState", "");
        }
    });*/

    $("a#analysisLink").on("click", function () {
        if ($("#resultForm").serialize() == "") {
            MobyAlert("Please select testcases to analyze", { level: "warning" });
            return false;
        }
        $.colorbox({
            href: $(this).attr("href") + "_AJAX",
            data: $("#resultForm").serialize(),
            width: "1000px", height: "650px",
            onLoad: function () { },
            onComplete: function () { $("#cboxLoadedContent form").MobyForm(); $("#cboxLoadedContent form").MobyFormTab(); }
        });
        return false;
    });

    $("#headlines").on("click", "#addBugButton", function () {
        $.get("Result/AddBugLink_AJAX/" + $("#toBeAddedBugId").val(), function (data) {
            //var data = eval(dataJson);
            $("#linkedBugsTable").find("tbody").append("<tr><td>" + data.BugId + "</td><td>" + data.Status + "</td><td>" + data.Title + "</td></tr>");
        }, "json");
    });

}
function unsetResultsEvents() {
    $("a#analysisLink").off("click");
}
function loadResults() {
    var form = $("#resultForm");
    /*$(".resultTree").MobyThreeStateCheckboxTree({
        onNodeUpdate: function (node, state) {
            if (state != "partial") {
                node.children("table").children("tbody").find("input[type=checkbox]"+(state=="all"?":not(:checked)":":checked")).trigger("change", [state, true]);
            }
        }
    });
    $(".resultTree>li ul, .resultTree>li table").hide();*/
    
    $("#content.resultController form").MobyFormTab({
        height: form.parent().height(),
        width: form.width()-20,
        onTabClick: function (e, tabClicked, data) {
            if (e.originalEvent !== undefined) {
                var selector = encodeURIComponent(getSelector(tabClicked));
                var x = $("head>meta[name='currentUrl']").attr('content') + "#" + selector + "&click";
                history.pushState(null, document.title, x);
            }

        }
    });
    $(".fieldsetWrapper fieldset").prepend('<input type="text" class="search sprited" spellcheck="false" />');
    $(".resultTree table").MobyTable({ searchInput: $(this).closest("fieldset").children("input.search") });
    
    $(".resultTree table input[type=checkbox]").each(function () {
        var checkbox = $(this)
        checkbox.MobyThreeStateCheckbox({
            onStateSet: function (state, silent) {
                /*if (silent) return 0;

                var allChecked = true;
                var noneChecked = true;
                checkbox.closest("tbody").find("input[type=checkbox]").each(function () {
                    if ($(this).prop("checked")) {
                        noneChecked = false;
                    } else {
                        allChecked = false;
                    }
                });

                var overBox = checkbox.closest("li").children("input[type=checkbox]");
                if (allChecked) {
                    overBox.trigger("change", "all");
                } else if (noneChecked) {
                    overBox.trigger("change", "");
                } else {
                    overBox.trigger("change", "partial");
                }*/
            }
        });
    });
}
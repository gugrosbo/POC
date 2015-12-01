(function ($) {

    /*if (!window.transitionEndRemoval) {
        transitionEndEvent = whichTransitionEvent();
        $(document).on(transitionEndEvent, function (e) { $(e.target).off(transitionEndEvent) });
        window.transitionEndRemoval = true;
    }*/

    $.fn.MobyFormTab = function (options) {
        var defaults =
        {
            activeTabIndex: 0,
            duration: 400,
            onInitComplete: function () { },
            onTabClick: function () { return true; },
            onTabSlidingComplete: function () { },
            onBeforeResize: function () { },
            bookmarkWidth: 51,
            height: -1,
            width: -1,
            minHeight: 300,
        };

        var params = $.extend(defaults, options);
        var fnId = $(".MobyTabForm").size();
        return this.each(function (n) {
            if (!$(this).is("form"))
                return;

            var form = $(this);
            var totalWidth = 0;
            var maxHeight = 0;
            var defaultWidth = 0;
            var activeTabIndex = params.activeTabIndex;
            var nbTab = form.children("fieldset").size();

            form.addClass("MobyFormTab");
            form.children("fieldset").wrap('<div class="fieldsetWrapper" />');

            defaultWidth = form.innerWidth() - nbTab * 50 - 25; //remove 20 for the scroll bar

            form.children('.fieldsetWrapper').each(function (i) {
                if (i == activeTabIndex) {
                    $(this).addClass('active');
                }

                var fieldset = $(this).children("fieldset");
                $(this).css("min-height", params.minHeight + "px");
                $(this).prepend('<div id="fieldsetBookMark' + n + i + fnId + '" class="fieldsetBookmark ' + fieldset.attr('class') + '"><div>' + fieldset.children('legend').text() + '</div><div>' + i + '</div></div>');
            });

            formTabResize(form, params);

            params.onInitComplete();
            $.colorbox.resize();

            form.find(".fieldsetWrapper input.next[type=button]").click(function () {
                $(this).closest(".fieldsetWrapper").next().find(".fieldsetBookmark").click();
            });
            form.find(".fieldsetWrapper input.previous[type=button]").click(function () {
                $(this).closest(".fieldsetWrapper").prev().find(".fieldsetBookmark").click();
            });
            $(window).resize(function () { formTabResize(form, params); });

        });
    };

    $.fn.addMobyTab = function (options) {
        var defaults =
        {
            title: "",
            content: "",
            id: "",
            insertBefore: -1,
            class: "",
            onAdditionComplete: function () {
            },
        };
        var fnId = $(".MobyTabForm").size();
        var params = $.extend(defaults, options);

        return this.each(function (n) {
            if (!$(this).is("form"))
                return;
            var form = $(this);
            var nbTab = form.children(".fieldsetWrapper").size();
            var nTab = (params.insertBefore < 0 ? params.insertBefore : nbTab);
            var active = form.children(".active");
            var width = active.children("fieldset").width();
            var height = active.children("fieldset").height();

            var str = '<div class="fieldsetWrapper new" style="padding-left:0;" id="' + params.id + '" class"' + params.class + '">'
            + '<div id="fieldsetBookMark' + n + +fnId + nTab + '" class="fieldsetBookmark ' + params.class + '"><div>' + params.title + '</div><div>' + nTab + '</div></div>'
            + ' <fieldset style=" width:' + (width - 52) + 'px; height:' + height + 'px"><legend>' + params.title + '</legend>' + params.content + '</fieldset> </div>';
            /**/

            params.width = form.width();

            active.animate({ width: active.width() - 52 });
            form.children(".fieldsetWrapper").children("fieldset").animate({ width: active.children("fieldset").width() - 52 });
            if (params.insertBefore == -1) {
                form.append(str);

            } else {
                form.children(".fieldsetWrapper:eq(" + params.insertBefore + ")").before(str);
                form.find(".fieldsetBookmark").each(function (i) {
                    $(this).attr("id", 'fieldsetBookMark' + n + +fnId + i);
                    $(this).children(":eq(1)").html(i);
                });
            }
            form.children(".fieldsetWrapper.new").animate({ paddingLeft: 51 }).removeClass("new");
            formTabSetEvents(form, 400);
        });
    }

    $.fn.removeMobyTab = function(options) {
        var defaults =
        {
            index: -1,
            onRemoveComplete: function() {},
        };
        var fnId = $(".MobyTabForm").size();
        var params = $.extend(defaults, options);

        return this.each(function(n) {
            if (!$(this).is("form"))
                return;
            var form = $(this);
            var nbTab = form.children(".fieldsetWrapper").size();
            var nTab = (params.insertBefore < 0 ? params.insertBefore : nbTab);
            var active = form.children(".active");
            var width = active.children("fieldset").width();
            var height = active.children("fieldset").height();
            var str = '<div class="fieldsetWrapper new" style="padding-left:0;" id="' + params.id + '" class"' + params.class + '">'
                + '<div id="fieldsetBookMark' + n + +fnId + nTab + '" class="fieldsetBookmark ' + params.class + '"><div>' + params.title + '</div><div>' + nTab + '</div></div>'
                + ' <fieldset style=" width:' + (width - 52) + 'px; height:' + height + 'px"><legend>' + params.title + '</legend>' + params.content + '</fieldset> </div>';
            /**/

            params.width = form.width();

            active.animate({ width: active.width() - 52 });
            form.children(".fieldsetWrapper").children("fieldset").animate({ width: active.children("fieldset").width() - 52 });
            if (params.insertBefore == -1) {
                form.append(str);

            } else {
                form.children(".fieldsetWrapper:eq(" + params.insertBefore + ")").before(str);
                form.find(".fieldsetBookmark").each(function(i) {
                    $(this).attr("id", 'fieldsetBookMark' + n + +fnId + i);
                    $(this).children(":eq(1)").html(i);
                });
            }
            form.children(".fieldsetWrapper.new").animate({ paddingLeft: 51 }).removeClass("new");
            formTabSetEvents(form, 400);
        });
    };

    function formTabResize(form, params) {
        var totalWidth = 0;
        var maxHeight = 0;
        var defaultWidth = 0;
        var nbTab = form.children(".fieldsetWrapper").size();

        if (params.width <= 0) {
            params.width = form.width();
        }

        defaultWidth = params.width - 2 - nbTab * params.bookmarkWidth;

        var fieldsetPadding;
        form.children('.fieldsetWrapper').each(function (i) {
            if ($(this).hasClass("active")) {
                $(this).css("width", defaultWidth);
                var fieldset = $(this).children("fieldset");
                fieldsetPadding = fieldset.innerWidth() - fieldset.width();
            }
            totalWidth += $(this).outerWidth();

            if (params.height > 0) {
                maxHeight = params.height;
            } else {
                maxHeight = ($(this).height() > maxHeight) ? $(this).height() : maxHeight;
            }

        });
        var fieldset = form.find('fieldset');
        var paddingTop = fieldset.css("padding-top").replace("px", "");
        var paddingBottom = fieldset.css("padding-bottom").replace("px", "");
        form.find('fieldset').css({ height: (maxHeight - paddingTop - paddingBottom) + "px", width: (defaultWidth - fieldsetPadding) + "px" });

        formTabSetEvents(form, params.duration, params.onTabClick);

    }

    function formTabSetEvents(form, duration, onTabClick) {
        var transition = false;
        form.children('.fieldsetWrapper').children('.fieldsetBookmark').off("click").on("click", function (e, data) {
            if (onTabClick != null) {
                if (!onTabClick(e, $(this), data)) {
                    return;
                }
            }
            var fielddsetWrapper = $(this).closest('.fieldsetWrapper');

            if (!fielddsetWrapper.hasClass('active') && !transition) {
                transition = true;
                var active = form.children(".fieldsetWrapper.active");
                var w = active.width();
                active.width(0);
                active.removeClass('active');
                fielddsetWrapper.addClass('active');
                fielddsetWrapper.width(w);
                
                transition = false;
            }

        });
    }

})(jQuery);
(function ($) {



    $.fn.MobyClassicTab = function (options) {
        var defaults =
        {
            activeTabIndex: 0,
            duration: 400,
            onInitComplete: function () { },
            onTabClick: function () { },
            onTabSlidingComplete: function () { },
            onBeforeResize: function () { },
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
            var activeTabIndex = params.activeTabIndex;

            form.addClass("MobyClassicTab");
            var iteration = 1;
            if (form.children(".tabTitles").length == 0) {
                iteration = 0;
                form.prepend('<div class="tabTitles"></div>');
            }
            form.children("fieldset").wrap('<div class="fieldsetWrapper" />');

            form.children('.fieldsetWrapper').each(function (i) {
                if (i == activeTabIndex) {
                    $(this).addClass('active');
                }

                var fieldset = $(this).children("fieldset");
                $(this).addClass(fieldset.children('legend').text());

                $(this).css("min-height", params.minHeight + "px");
                if (iteration == 0) {
                    form.children(".tabTitles").append('<div id="fieldsetBookMark' + n + i + fnId + '" class="fieldsetBookmark ' + fieldset.attr('class') + ' ' + (i == activeTabIndex ? "active" : "") + '"><div>' + fieldset.children('legend').text() + '</div></div>');
                }
            });

            formTabResize(form, params);

            params.onInitComplete();
            $.colorbox.resize();

            $(window).resize(function () { formTabResize(form, params); });
        });
    };

    function formTabResize(form, params) {
        if (params.width <= 0) {
            params.width = form.width();
        }
        var fieldsetPadding;
        form.children('.fieldsetWrapper').each(function (i) {
            $(this).width(params.width);
            if (params.height > 0) {
                $(this).height(params.height - 50);
            }
        });
        formTabSetEvents(form, params.duration, params.onTabClick);
    }

    function formTabSetEvents(form, duration, onTabClick) {
        var transition = false;
        form.children('.tabTitles').children('.fieldsetBookmark').off("click").on("click", function (e, data) {
            if (onTabClick != null)
                onTabClick(e, $(this), data);

            var fieldsetWrapper = form.children('.fieldsetWrapper:eq(' + ($(this).index()) + ')');


            if (!fieldsetWrapper.hasClass('active') && !transition) {
                transition = true;

                var active = form.children(".fieldsetWrapper.active");

                var fieldsetBookMark = $(this);
                var activeBookMark = form.children('.tabTitles').children('.fieldsetBookmark.active');

                active.removeClass('active');
                fieldsetWrapper.addClass('active');

                activeBookMark.removeClass('active');
                fieldsetBookMark.addClass('active');
                transition = false;

            }
        });
    }

})(jQuery);
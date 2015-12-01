(function ($) {
    $.fn.MobyPrettyScroll = function (options) {
        var defaults =
        {
        };

        return this.each(function (n) {
            var div = $(this);
            var overflowBoth = div.css("overflow") == "scroll";
            var overflowX = div.css("overflow-x") == "scroll";
            var overflowY = div.css("overflow-y") == "scroll";

            var draggingX = false;
            var draggingY = false;

            var prettyScrollX;
            var prettyScrollXWidth;

            var prettyScrollY;
            var prettyScrollYHeight;

            if (overflowBoth || overflowX || overflowY) {
                if (div.css("overflow") == "scroll") {
                    div.css("overflow", "hidden");
                    div.append('<div class="prettyScrollHorizontal"> </div>');
                    div.append('<div class="prettyScrollVertical"> </div>');
                }
                if (overflowY) {
                    div.css("overflow-y", "hidden");
                    div.append('<div class="prettyScrollVertical"> </div>');
                }
                if (overflowX) {
                    div.css("overflow-x", "hidden");
                    div.append('<div class="prettyScrollHorizontal"> </div>');
                }

                if (overflowX || overflowBoth) {
                    prettyScrollX = div.children("div.prettyScrollHorizontal");
                    prettyScrollX.disableSelection();
                    prettyScrollXWidth = div.width() * div.width() / div[0].scrollWidth;
                    prettyScrollX.width(prettyScrollXWidth);
                    prettyScrollX.on("mousedown", function (e) {
                        draggingX = true;
                    });
                    
                }

                if (overflowY || overflowBoth) {
                    prettyScrollY = div.children("div.prettyScrollVertical");
                    prettyScrollY.disableSelection();
                    prettyScrollYHeight = div.height() * div.height() / div[0].scrollHeight;
                    prettyScrollY.height(prettyScrollYHeight);
                    prettyScrollY.on("mousedown", function (e) {
                        draggingY = true;
                    });
                }

                $(document).on("mouseup", function (e) {
                    draggingX = false;
                    draggingY = false;
                });

                $(document.body).on("mousemove", function (e) {
                    if (draggingX) {
                        prettyScrollX.offset({
                            left: Math.min(Math.max(e.pageX,div.offset().left),div.offset().left + div.width())
                        });
                        div.scrollLeft(prettyScrollX.offset().left * div[0].scrollWidth / (div.width() - prettyScrollX.width()));
                    }

                    if (draggingY) {
                        prettyScrollY.offset({
                            top: Math.min(Math.max(e.pageY, div.offset().top), div.offset().top + div.height()),
                        });
                        div.scrollTop(prettyScrollY.offset().top * div[0].scrollHeight / (div.height() - prettyScrollY.height()));
                    }
                });
            }
        });
    };

    $(function () {
        $.extend($.fn.disableTextSelect = function () {
            return this.each(function () {
                if ($.browser.mozilla) {//Firefox
                    $(this).css('MozUserSelect', 'none');
                } else if ($.browser.msie) {//IE
                    $(this).bind('selectstart', function () { return false; });
                } else {//Opera, etc.
                    $(this).mousedown(function () { return false; });
                }
            });
        });
        $('.noSelect').disableTextSelect();//No text selection on elements with a class of 'noSelect'
    });

})(jQuery);
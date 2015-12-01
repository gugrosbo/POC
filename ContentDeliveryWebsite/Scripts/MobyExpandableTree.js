// --------------------------------------------------------------------------------------------------------------------
// <copyright file="MobyExpandableTree.js" company="Microsoft">
//   
// </copyright>
// <summary>
//   JQuery plugin :
//   allow to use nested lists as an expandable tree
// </summary>
// --------------------------------------------------------------------------------------------------------------------

(function ($) {
    $.fn.MobyExpandableTree = function (options) {
        var defaults =
        {

        };

        var params = $.extend(defaults, options);

        return this.each(function () {
            var root = $(this);
            var inTransition = false;
            root.find("ul").hide();
            root.on("click", "a", function () {
                if (inTransition) {
                    return;
                }

                inTransition = true;
                var clickedList = $(this).closest("li");
                if (clickedList.children("ul").size() > 0) {
                    clickedList.children("ul").slideToggle(100, function() { inTransition = false; });
                } else {
                    inTransition = false;
                }
            });
        });
    };
})(jQuery);
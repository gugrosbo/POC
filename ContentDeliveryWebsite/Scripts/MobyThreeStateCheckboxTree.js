  (function ($) {
    $.fn.MobyThreeStateCheckboxTree = function (options) {
        var defaults =
        {
            filter: "",
            onNodeUpdate: function (node, state) { }
        };

        var params = $.extend(defaults, options);

        return this.each(function (n) {
            var root = $(this);
            root.find("li>input[type='checkbox']" + params.filter).each(function () {
                var checkbox = $(this);
                checkbox.MobyThreeStateCheckbox({
                    onStateSet: function (state, silent) {
                        if (!silent) {
                            checkbox.parent().find("ul>li>input[type='checkbox']").each(function () {
                                $(this).trigger("change", [state, true]);
                            });


                            updateState(checkbox.parent());
                        }
                        params.onNodeUpdate(checkbox.parent(), state);
                    }
                });
            });
        });

        function updateState(node) {
            var isRoot = !node.parent().parent().is("li");

            if (isRoot) return 0;

            var allChecked = true;
            var noneChecked = true;

            node.parent().children("li").each(function () {
                var box = $(this).children(".checkbox");
                if (box.hasClass("checked")) {
                    noneChecked = false;
                } else if (box.hasClass("partial")) {
                    noneChecked = false;
                    allChecked = false;
                }
                else {
                    allChecked = false;
                }
            });


            var overLi = node.parent().parent();

            var overBox = overLi.children("input[type=checkbox]");
            var state;
            if (allChecked) {
                state = "all";
            } else if (noneChecked) {
                state = "";
            } else {
                state = "partial";
            }
            overBox.trigger("change", [state, true]);
            params.onNodeUpdate(node.parent().parent(), state);
            updateState(overLi);
        }
    };
})(jQuery);

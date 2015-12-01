(function ($) {
    $.fn.MobyThreeStateCheckbox = function (options) {
        var defaults =
        {
            onChoicePanelComplete: function (container) { },
            onStateSet: function (state, check, isHuman) { },
            onPostClick: function (box) { },
            onChoiceDone: function (container, choice) { },
            onChoiceClick: function (container) { },
        };

        var params = $.extend(defaults, options);


        return this.each(function (n) {
            var checkbox = $(this);
            var box;
            var closestForm = checkbox.closest("form");
            var threeStateChoicePanel;

            checkbox.hide();
            checkbox.after('<div class="checkbox"><div></div></div>');
            box = checkbox.next();

            if (checkbox.prop("checked")) {
                box.addClass("checked");
            }

            if (checkbox.attr('data-threeStateExtendedChoiceLink') != null) {
                box.addClass("disabled");
                checkbox.prop("disabled", true);

                var sonic = new Sonic('infiniteHeight');
                var ajaxWaiterContainer = document.createElement('div');
                $(ajaxWaiterContainer).addClass("ajaxPreloaderSmall").css({ right: "15px", top: 0 });
                ajaxWaiterContainer.appendChild(sonic.canvas);
                box.after(ajaxWaiterContainer);
                sonic.play();
                $(ajaxWaiterContainer).show();

                $.get(checkbox.attr('data-threeStateExtendedChoiceLink'),
                    function (dataText) {
                        threeStateChoicePanel = dataText;
                        data = $("<div>" + dataText + "</div>");
                        if (data.find('form'))
                            data.find("input[type=checkbox]").attr("checked", "checked");
                        checkbox.attr("data-checkedValue", data.find("form").serialize());

                        checkbox.prop("disabled", false);
                        box.removeClass("disabled");
                        $(ajaxWaiterContainer).hide();
                    });
            }
            checkbox.bind("launchChoicesThreeStateCheckbox", function (e, previousChoices) {
                if (checkbox.attr('data-threeStateExtendedChoiceLink') != null) {
                    //three state choice url
                    closestForm.parent().prepend('<div id="threeStateCheckBoxChoice">' + threeStateChoicePanel + '</div>');
                    var container = $("#threeStateCheckBoxChoice");

                    var checkedIds = previousChoices.split("&");
                    $.each(checkedIds, function (index, value) {
                        var checkedId = value.split("=");
                        $("input[type=checkbox]").each(function () {
                            if ($(this).attr('name') == checkedId[0] && $(this).attr('value') == decodeURIComponent(checkedId[1]).replace("+", " ")) {
                                $(this).prop("checked", true).trigger("change");
                            }
                        });
                    });

                    container.on("click", ".validateThreeStateChoices", function () {
                        params.onChoiceDone.call(checkbox, container, container.find("form").serialize());
                        var state, data;
                        if (container.find("tbody input[type=checkbox]:not(:checked)").size() == 0) {
                            state = true;
                        }
                        else if (container.find("tbody input[type=checkbox]:checked").size() == 0) {
                            state = false;
                        } else {
                            state = true;
                            data = decodeURIComponent(container.find("form").serialize());
                        }
                        boxTo(box, checkbox, state, data, false);

                        container.fadeOut(300, function () {
                            container.remove();
                            closestForm.fadeIn(300);
                            choicePanelActive = false;
                        });

                    });

                    container.on("click", ".cancel", function () {
                        container.fadeOut(300, function () {
                            container.remove();
                            closestForm.fadeIn(300);
                            choicePanelActive = false;
                        });
                    });

                    closestForm.fadeOut(300, function () {
                        container.css({ display: "block", visibility: "visible", opacity: 0 });
                        params.onChoicePanelComplete.call(checkbox, container);
                        container.fadeTo(300, 400);
                    });
                } else {
                    //two state
                    checkbox.trigger("click");
                }
            });

            //take care of the label behavior
            var choicePanelActive = false;
            checkbox.closest('dl').find('label[for=' + checkbox.attr('id') + ']').on("click", function (e) {
                e.preventDefault();
                if (!choicePanelActive) {
                    var data = checkbox.attr("value");
                    params.onChoiceClick.call(checkbox, checkbox);
                    choicePanelActive = true;
                    checkbox.trigger('launchChoicesThreeStateCheckbox', data);
                }
            });

            box.on("click", function (origEvent) {
                var event = jQuery.Event("click");
                event.originalEvent = origEvent.originalEvent;

                if (origEvent) {
                    event.shiftKey = origEvent.shiftKey;
                }
                getCheckbox($(this)).trigger(event);
                params.onPostClick.call(getCheckbox($(this)), $(this));
            });

            checkbox.on("change", function (e) {
                var cur = $(this).prop("checked");
                boxTo(getBox($(this)), $(this), cur, null, isHuman(e));
            });
            
            
        });

        function boxTo(box, checkbox, check, data, isHuman) {
            var state;
            if (check && data == null) {
                state = "all";
                checkbox.attr("value", checkbox.attr("data-checkedValue"));
                box.removeClass('partial').addClass('checked');
                checkbox.prop("checked", true);
            }
            else if (check && data != null) {
                state = "partial";
                checkbox.attr("value", data);
                box.removeClass('checked').addClass('partial');
                checkbox.prop("checked", true);
            } else {
                state = "none";
                checkbox.attr("value", "");
                box.removeClass('partial').removeClass('checked');
                checkbox.prop("checked", false);
            }
            params.onStateSet.call(checkbox, state, check, isHuman);
        }
        
        function getCheckbox(box) {
            return box.prev();
        }
        
        function getBox(checkbox) {
            return checkbox.next();
        }
    };
})(jQuery);
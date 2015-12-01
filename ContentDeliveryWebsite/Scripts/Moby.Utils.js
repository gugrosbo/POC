(function ($) {
    $.fn.getStyleObject = function () {
        var dom = this.get(0);
        var style;
        var returns = {};
        if (window.getComputedStyle) {
            var camelize = function (a, b) {
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for (var i = 0, l = style.length; i < l; i++) {
                var prop = style[i];
                var camel = prop.replace(/\-([a-z])/g, camelize);
                var val = style.getPropertyValue(prop);
                returns[camel] = val;
            };
            return returns;
        };
        if (style = dom.currentStyle) {
            for (var prop in style) {
                returns[prop] = style[prop];
            };
            return returns;
        };
        return this.css();
    }
})(jQuery);


function getSelector(el, str) {
    if (!str) str = "";
    if (el.attr("id") !== undefined) {
        return "#" + el.attr("id") + str;
    }
    else if (el.is("html")) {
        return "html" + str;
    } else {
        return getSelector(el.parent(), ">" + el.prop("tagName") + ":eq(" + el.index() + ")" + str);
    }
}


function isHuman(event) {
    return event.originalEvent != null;
}

function whichTransitionEvent() {
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
        if (el.style[t] !== undefined) {
            return transitions[t];
        }
    }
}

function getCurentUrl() {
    var t = $("head>meta[name='currentUrl']").attr('content');
    if (t == undefined || t == "") {
        t = window.location.hash.substring(1);
        if (t.indexOf("#") != -1) {
            t = t.substring(0, t.indexOf("#"));
        }
        t = "#" + t;
        $("head>meta[name='currentUrl']").attr('content', t);
    } else {
        t = t + "?" + $("#branchSelection").val();
    }
    return t;
}

jQuery.fn.exists = function () { return this.length > 0; };


function MobyAlert(message,options) {
        var defaults =
        {

        };
        
        var params = $.extend(defaults, options);
        var fnId = $(".MobyTable").size();

        $("body").prepend('<div id="MobyMessageWrapper"><div id="MobyMessage">' + message + '</div></div>');
        var opacity = $("#MobyMessageWrapper").css("opacity");
        $("#MobyMessageWrapper").fadeTo(0, 0);

        var top = Math.floor(($(document).height() - $("#MobyMessage").height()) / 2);
        var left = Math.floor(($(document).width() - $("#MobyMessage").width()) / 2);
        $("#MobyMessage").css({ top: top, left: left });
        $("#MobyMessageWrapper").fadeTo(400,opacity);
        $("#MobyMessageWrapper").on("click", function () { $("#MobyMessageWrapper").remove(); });
}


function MobyNotify(message, options) {
    MobyAlert(message,options)
}

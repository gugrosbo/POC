function HostsPage(launcher) {
    BasePage.apply(this, arguments);
    this.refreshInterval = window.setInterval(this.refresh, 10000);
}

HostsPage.prototype = new BasePage();

HostsPage.prototype.constructor = HostsPage;

HostsPage.prototype.DestroyPage = function () {
    window.clearInterval(this.refreshInterval);
};

HostsPage.prototype.LoadPage = function () {

    MakeSelectable("#containerList");
    MakeSelectable("#hostList");
    MakeSelectable("#imageList");

    

    $("#hostList").on("selected", function () {
        var tr = $(this).find(".selected");
        var hostName = tr.length > 0 ? tr.find("td:eq(0)").text() : undefined;
        UpdateContainer(hostName);
        UpdateImages(hostName)
    });

    $("#containerList").on("selected", function () {
        var tr = $(this).find(".selected");
        var containerId = FindField(tr, "id");
        UpdateLinks(containerId);
    });
    HookRefreshers();
    UpdateHosts();
    UpdateImages();
    UpdateContainer();

    $("#startContainerButton").click(this.StartSelectedContainer);
    $("#stopContainerButton").click(this.StopSelectedContainer);
    $("#deleteContainerButton").click(this.DeleteSelectedContainer);
    $("#connectContainerButton").click(this.ConnectToSelectedContainer);
    
    $("#containerList").on("selected", this.OnContainerSelected);

    var form = $("#content form");
    form.MobyClassicTab({
        height: form.parent().height(),
        width: form.width(),
        onTabClick: function (e, tabClicked, data) {
            var tabName = tabClicked.text().trim();
            $(".refresher").hide();
            if (tabName === "Containers") {
                $("#startContainerButton").show();
                $("#stopContainerButton").show();
                $("#deleteContainerButton").show();
                $("#connectContainerButton").show();
                $("#createContainerButton").show();

                $("#refreshContainerButton").show();
                $(".addHostButton").hide();
            } else {
                if (tabName === "Hosts") {
                    $("#refreshHostsButton").show();
                }
                else if (tabName === "Images") {
                    $("#refreshImagesButton").show();
                }
                else if (tabName === "Links") {
                    $("#refreshLinksButton").show();
                }

                $("#startContainerButton").hide();
                $("#stopContainerButton").hide();
                $("#deleteContainerButton").hide();
                $("#connectContainerButton").hide();
                $("#createContainerButton").hide();

                if (tabName == "Hosts") {
                    $(".addHostButton").show();
                } else {
                    $(".addHostButton").hide();
                }
            }
        }
    });

    // $(".fieldsetWrapper fieldset").prepend('<input type="text" class="search sprited" />');

    $("#content table.MobyTable").each(function () {
        var table = $(this);
        table.MobyTable({
            scroll: true,
            searchInput: table.closest("fieldset").children("input.search"),
            isRowSortable: function (i) { return true; },
            onHideRow: function (row) { row.next().addClass("hiddenBySearch") },
            isColumnSortable: function (i) { return true; },
            isColumnFilterable: function (i) { return false; }
        });
    });

    $(".addHostButton").on("onColorBoxFormComplete", function(e, formLoaded) {
        e.stopImmediatePropagation();
        var form = $(formLoaded);

        if (!form.IsLoaded) {
            form.IsLoaded = true;
            form.MobyForm({
                lightBoxed: true,
                //submitMode: "json",
                onFormComplete: function () {
                    form.attr("action", serverUrl + "/api/hosts");
                    form.MobyFormTab({
                        height: 700
                    });
                },
                onBeforeSubmit:function (){
                    return true;
                },
                onSubmitComplete: function(data) {

                    $.colorbox.element().remove();
                    $.colorbox.close();
                }
            });
        }
    });
};

HostsPage.prototype.StartSelectedContainer = function() {
    var containerId = $("#containerList .selected").find("td:eq(5)").text();
    if (containerId != "") {
        $.post("http://mobydockmgmt1.azurewebsites.net/api/containers/" + containerId + "/start", function (data) {
            if (data == "Successful") {
                alert("Start container successfully!");
                $("#containerList .selected").find("td:eq(1)").html('<div class="' + GetClassForState("Running") + '"/>Running');
            }
            else if (data == "NoAction") {
                alert("The container is already running: no action happened!");
                $("#containerList .selected").find("td:eq(1)").html('<div class="' + GetClassForState("Running") + '"/>Running');
            }
            else if (data == "Failed") {
                alert("Start container failed!");
            }
        }, "json");

    }
    return false;
}
HostsPage.prototype.StopSelectedContainer = function () {
    var containerId = $("#containerList .selected").find("td:eq(5)").text();
    if (containerId != "") {
        $.post("http://mobydockmgmt1.azurewebsites.net/api/containers/" + containerId + "/stop", function (data) {
            if (data == "Successful")
            {
                alert("Stop container successfully!");
                $("#containerList .selected").find("td:eq(1)").html('<div class="' + GetClassForState("Stopped") + '"/>Stopped');
            }
            else if(data == "NoAction")
            {
                alert("The container is already stopped: no action happened!");
                $("#containerList .selected").find("td:eq(1)").html('<div class="' + GetClassForState("Stopped") + '"/>Stopped');
            }
            else if (data == "Failed") 
            {
                alert("Stop container failed!");
            }
        }, "json");
    }
    return false;
}
HostsPage.prototype.DeleteSelectedContainer = function () {
    var containerId = $("#containerList .selected").find("td:eq(5)").text();
    if (containerId != "") {
        $.ajax({
            url: "http://mobydockmgmt1.azurewebsites.net/api/containers/?id=" + containerId,
            type: 'DELETE',
            success: function (result) {
                $("#containerList .selected").remove();
                $("#containerList").trigger("selected");
            }
        });
    }
    return false;
}
HostsPage.prototype.ConnectToSelectedContainer = function () {
    var containerName = $("#containerList .selected").find("td:eq(0)").text();
    var hostId = FindField($("#containerList .selected"), "hostId"); 
    if (hostId != "") {
        $.get("http://mobydockmgmt1.azurewebsites.net/api/hosts/?id=" + hostId, function (data) {

            var title = String.format('Container : {0}, Host : {1}', containerName, data.name);

            var dockerCmd = String.format('@echo off\r\npowershell.exe -noExit -command \"$Host.UI.RawUI.WindowTitle = \'{3}\'\";\"C:\\ProgramData\\chocolatey\\lib\\docker.1.7.0\\bin\\docker.exe --host=\"{0}:{1}\" exec -it {2} bash\"',
                data.name, data.port, containerName, title);
            download('ConnectContainer.bat', dockerCmd);
        });
    }
    return false;
}
HostsPage.prototype.OnContainerSelected = function () {
    var tr = $(this).find(".selected");
    var selected = tr.length > 0;
    if (selected) {
        $("#startContainerButton").removeClass("disabled");
        $("#stopContainerButton").removeClass("disabled");
        $("#connectContainerButton").removeClass("disabled");
        $("#deleteContainerButton").removeClass("disabled");
    }
    else {
        $("#startContainerButton").addClass("disabled");
        $("#stopContainerButton").addClass("disabled");
        $("#deleteContainerButton").addClass("disabled");
        $("#connectContainerButton").addClass("disabled");
    }
}


var serverUrl = "http://mobydockmgmt1.azurewebsites.net";
//var serverUrl = "http://localhost:62113/";

function UpdateHosts(onSuccess) {
    $("#hostList").find("tbody tr").remove();
    $.get(serverUrl + "/api/hosts", function(data) {
        data.forEach(function(d) {
            AppendLine($("#hostList"), d);
        });
        if(onSuccess != undefined)onSuccess();
    });
}

function UpdateContainer(hostName, onSuccess) {
    $("#containerList").find("tbody tr").remove();
    var url = hostName == undefined ? serverUrl + "/api/containers" : serverUrl + "/api/containers?hostName=" + hostName;
    $.get(url, function(data) {
        data.forEach(function (d) {
            if (d.composeGroup == null) {
                d.composeGroup = "Error";
            }
            AppendLine($("#containerList"), d, function(key, value) {
                if (key == "state") {
                    return '<div class="' + GetClassForState(value) + '"/>' + value;} return undefined});
        });
        if (onSuccess != undefined) onSuccess();
    });
}

function UpdateImages(hostName, onSuccess) {
    $("#imageList").find("tbody tr").remove();
    var url = (hostName == undefined) ? serverUrl + "/api/images" : serverUrl + "/api/images?hostName=" + hostName;
    $.get(url, function(data) {
        data.forEach(function (d) {
            AppendLine($("#imageList"), d);
        });
        if (onSuccess != undefined) onSuccess();
    });
}

function UpdateLinks(containerId, onSuccess) {
    $("#graph-container").html("");
    if (containerId == undefined || containerId ==="") {
        return;
    }

    var url = serverUrl + "/api/containers/" + containerId +"/links";
    $.get(url, function (data) {
        $("#graph-container").html("");
        var g = new Graph();
        var rootRender = function(r, n) {
            /* the Raphael set is obligatory, containing all you want to display */
            var set = r.set().push(
                /* custom objects go here */
                r.rect(n.point[0]-30, n.point[1]-13, 62, 86)
                    .attr({"fill": "#fa8", "stroke-width": 2, r : "9px"}))
                    .push(r.text(n.point[0], n.point[1] + 30, n.label)
                        .attr({"font-size":"20px"}));
            
            return set;
        };
        data.nodes.forEach(function (node, i) {
            if (i == 0) {
                g.addNode(node.id, {
                    label: node.name,
                    render: rootRender
                });
            } else {
                g.addNode(node.id, {
                    label: node.name
                });
            }
        });
        data.edges.forEach(function (edge) {
            //var nodes = $.grep(data.nodes, function (n, i) { return n.id == edge.item1 || n.id == edge.item2 })
            g.addEdge(edge.item1, edge.item2, {directed:true});
        });

        var layouter = new Graph.Layout.Spring(g);
        layouter.layout();

        var renderer = new Graph.Renderer.Raphael('graph-container', g, 400, 300);
        renderer.draw();

        if (onSuccess != undefined) onSuccess();
    });
}


function MakeSelectable(table) {
    $(table).on("click", "tbody tr",function () {
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
        } else {
            $(table + " tr.selected").removeClass("selected");
            $(this).addClass("selected");
        }
        $(table).trigger("selected");
    });
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function AppendLine(table, object, formatter) {
    var ths = table.find("thead>tr>th");
    var line = "<tr>";
    ths.each(function () {
        var style = "";
        var th = $(this);
        var key = th.attr("rel");
        var isVisible = th.is(":visible")
        if (!isVisible) {
            style = "display:none;";
        }
        var val = formatter == undefined ? object[key] : formatter(key, object[key]);
        line += "<td style=\"" + style + "\">" + (val == undefined ? object[key] : val) + "</td>";
    });
    line += "</tr >";
    table.children("tbody").append(line);
}

function FindField(tr, fieldName) {
    var table = tr.closest("table");
    var ths = table.find("thead>tr>th");
    var index = 0;
    ths.each(function (i) {
        var key = $(this).attr("rel");
        if (key === fieldName) {
            index = i;
        }
    });
    var text = tr.children("td:eq(" + index + ")").text();
    return text;
}


function HookRefreshers() {
    $("#refreshHostsButton").click(function () {
        var selectedTr = $("#hostList").find(".selected");
        var id = selectedTr.length>0 ? FindField(selectedTr, "id") : undefined;
        UpdateHosts(function() {
            if (id !== undefined) {
                var trs = $("#hostList").find("tbody tr");
                var same = trs.filter(function () { return FindField($(this), "id") === id });
                same.addClass("selected");
            }
        });
        
        return false;
    });

    $("#refreshContainerButton").click(function () {
        var selectedTr = $("#containerList").find(".selected");
        var id = selectedTr.length > 0 ? FindField(selectedTr, "id") : undefined;

        var hostname = undefined;
        var selectedHostTr = $("#hostList").find(".selected");
        if (selectedHostTr.length > 0) {
            hostname = FindField(selectedHostTr, "name");
        }
        UpdateContainer(hostname, function () {
            if (id !== undefined) {
                $("#containerList").find("tbody tr").filter(function() { return FindField($(this), "id") === id }).addClass("selected");
            }
        });
        return false;
    });

    $("#refreshLinksButton").click(function () {
        var selectedTr = $("#containersList").find(".selected");
        var id = selectedTr.length > 0 ? FindField(selectedTr, "id") : undefined;
        if (id !== undefined) {
            UpdateLinks(id);
        }
        return false;
    });

    $("#refreshImagesButton").click(function() {
        var selectedTr = $("#imageList").find(".selected");
        var id = selectedTr.length > 0 ? FindField(selectedTr, "id") : undefined;

        var hostname = undefined;
        var selectedHostTr = $("#hostList").find(".selected");
        if (selectedHostTr.length > 0) {
            hostname = FindField(selectedHostTr, "name");
        }

        UpdateImages(hostname, function () {
            if (id !== undefined) {
                $("#imageList").find("tr").filter(function() { return FindField($(this), "id") === id }).addClass("selected");
            }
        });
        return false;
    });
}


function GetClassForState(state) {
    if (state.toLowerCase() === "stopped") {
        return "sprited inline iconFailed";
    }
    if (state.toLowerCase() === "running") {
        return "sprited inline iconInProgress";
    }
}
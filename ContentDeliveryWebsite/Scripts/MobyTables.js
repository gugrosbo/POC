(function ($) {
    $.fn.MobyTable = function (options) {
        var defaults =
        {
            scroll: false,
            searchInput: null,
            isRowSortable: function (i) { return true; },
            isColumnSortable: function (i) { return true; },
            isColumnFilterable: function (i) { return true; },
            onHideRow: function (i) { },
        };

        var params = $.extend(defaults, options);
        var fnId = $(".MobyTable").size();

        return this.each(function (n) {

            var that = $(this);
            var thead = that.children("thead");
            var tbody = that.children("tbody");

            var columnCount = 0;
            that.css("max-height", "100%");
            that.addClass("MobyTable");
            
            that.on("resizeColumns", function(e) {
                resizeColumns(that,true);
            });
            
            thead.on("change", ".masterCheckbox", function (e) {
                if (isHuman(e)) {
                    var checked = $(this).prop("checked");
                    tbody.find("input[type=checkbox]").prop("checked", checked).trigger("change");
                }
            });
            
            tbody.on("click", "input[type=checkbox]", function (e) {
                
                if (!isHuman(e)) {
                    return;
                }
                
                clearSelection();

                var lastFocused = tbody.find("input[type=checkbox].lastClicked");
                lastFocused.removeClass("lastClicked");
                $(this).addClass("lastClicked");

                if (e.shiftKey && lastFocused.size() > 0) {
                    clearSelection();
                    var currentTr = $(this).closest("tr");
                    var lastFocusedIndex = lastFocused.closest("tr").index();
                    var thisIndex = currentTr.index();
                    var colIndex = $(this).closest("td").index();

                    var minIndex;
                    var maxIndex;
                    if (thisIndex < lastFocusedIndex) {
                        minIndex = thisIndex + 1;
                        maxIndex = lastFocusedIndex - 1;
                    } else {
                        currentTr = lastFocused.closest("tr");
                        minIndex = lastFocusedIndex + 1;
                        maxIndex = thisIndex - 1;
                    }

                    for (var i = minIndex; i <= maxIndex; i++) {
                        currentTr = currentTr.next("tr");
                        currentTr.children("td:eq(" + colIndex + ")").find("input[type = checkbox]").prop("checked", true).trigger("change");
                    }
                }
            });
            
            tbody.on("change", "input[type=checkbox]", function (e) {
                if (!isHuman(e) && that.get(0) == $(e.currentTarget).closest("table").get(0)) {
                    return;
                }
                
                var masterCheckbox = thead.find(".masterCheckbox");
                
                if (tbody.find("input[type=checkbox]:not(:checked)").size() == 0 && !masterCheckbox.prop("checked")) {
                    masterCheckbox.prop("checked", true).trigger("change");
                } else if (masterCheckbox.prop("checked")) {
                    masterCheckbox.prop("checked", false).trigger("change");
                }

            });

            
            
            var colSize = new Array();
            thead.children("tr:eq(0)").children("th").each(function (i) {
                if ($(this).children(".headerValue").length == 0) {
                    colSize[i] = $(this).width();
                    columnCount++;
                    var str = '<div class="headerValue">' + $(this).html() + '</div>';
                    if ($(this).hasClass("masterCheckboxContainer")) {
                        str = '<input type="checkbox" class="masterCheckbox" ' + (tbody.find("input[type=checkbox]:not(:checked)").size() == 0 && tbody.find("input[type=checkbox]").size() > 0 ? ' checked="checked" ' : '') + '/>' + str;
                    } else {
                        if (params.isColumnFilterable(i)) {
                            str = '<div class="filterDisplay sprited"></div>' + str;
                        }
                        if (params.isColumnSortable(i)) {
                            str = str + '<div class="orderDisplay sprited"></div>';
                        }
                    }

                    $(this).html(str);
                }
            });
            
            if (params.scroll) {
                that.wrap('<div class="scrollTableContainer" />');
                var container = that.parent();
                if (params.height == null)
                    container.height(container.parent().height() - container.position().top);
                thead.addClass("fixedHeader");
                var tbodyHeight = that.parent().height() - tbody.position().top;
                tbody.addClass("scrollContent");//.css("height", tbodyHeight);

                that.find("tr:eq(0) th").each(function (i) {
                    var width = colSize[i];
                    $(this).width(width);
                });

                if (tbody.get(0).scrollHeight > tbodyHeight) {
                    var lastColumn = thead.children("tr").children("th:last-child");
                    lastColumn.width(lastColumn.width() + 15);
                }
                
                resizeColumns(that, tbody.get(0).scrollHeight > tbodyHeight);
                

            }
            if (params.searchInput != null) {
                initSearch(thead, tbody);
            }

            /************** FILTER PART *******************/
            that.on("click", ".filterDisplay", function (e) {
                e.stopPropagation();

                var index = $(this).parent().index();
                var columnTitle = $(this).parent().text();
                var set = new Set();
                var th = $(this).parent();
                tbody.children("tr").each(function () {
                    $(this).children("td:eq(" + index + ")").each(function () {
                        set.add($(this).html());
                    });
                });

                var html = '<form class="filterForm"><fieldset><legend>Filter by ' + columnTitle + '</legend><dl>';
                var setArray = set.asArray();
                var activeThFilter = th.attr('data-filter') != undefined ? th.attr('data-filter') : "";
                for (var i = 0; i < setArray.length; i++) {

                    var checked = activeThFilter.indexOf(columnTitle + "==" + setArray[i]) != -1 ? 'checked="checked"' : "";
                    html += '<dt style="width:auto; text-align: right; float:left;">' + setArray[i] + '</dt><dd style="width:auto; text-align: right;"><input type="checkbox" name="' + columnTitle + '" value="' + setArray[i] + '" ' + checked + ' /></dd>';
                }
                html += '</dl><input type="submit" /></fieldset></form>';

                $("body").append('<div class="MobyTableFilterContainerWrapper"></div><div class="MobyTableFilterContainer">' + html + '</div>');
                var filterContainer = $(".MobyTableFilterContainer");
                filterContainer.css({ left: ($(document).width() / 2 - filterContainer.width() / 2) + 'px', top: ($(document).height() / 2 - filterContainer.height() / 2) + 'px' });
                $(".MobyTableFilterContainerWrapper").on("click", function () { $(this).remove(); $(".MobyTableFilterContainer").remove(); });

                $(".filterForm").on("submit", function () {
                    var filterQuery = $(this).serialize().replace(new RegExp("&", 'g'), " OR ").replace(new RegExp("=", 'g'), "==").replace(new RegExp("\\+", 'g'), " ");
                    if (filterQuery == "") {
                        filterQuery = "true";
                    }
                    th.attr('data-filter', "(" + filterQuery + ")");
                    var activeFilter = "";
                    th.parent().children().each(function () {
                        var thFilter = $(this).attr('data-filter');
                        if (thFilter != undefined && thFilter != "") {
                            activeFilter = (activeFilter == "") ? thFilter : activeFilter + " AND " + thFilter;
                        }
                    });
                    search(activeFilter, thead, tbody);

                    $(".MobyTableFilterContainerWrapper").remove();
                    $(".MobyTableFilterContainer").remove();
                    $(".filterForm").off("submit");
                    return false;
                });
            });

            that.on("click", "th", function () {
                clearSelection();
                sortColumn($(this));
            });
        });
        
        function sortColumn(header) {
            var headerIndex = header.index();

            if (!params.isColumnSortable(headerIndex) || header.find(".masterCheckbox").size() > 0) {
                return 0;
            }
            header.siblings(".ordered, .orderedDesc").removeClass("orderedDesc").removeClass("ordered");
            header.parent().find(".orderDisplay").html("");

            var desc = false;

            if (header.hasClass("ordered")) {
                header.removeClass("ordered");
                header.addClass("orderedDesc");
                //header.children(".orderDisplay").html("<");
                desc = true;
            } else {
                header.removeClass("orderedDesc");
                header.addClass("ordered");
                //header.children(".orderDisplay").html(">");
            }

            var tbody = header.parent().parent().next();
            var trsArrray = new Array();
            var trsExtendArray = new Array();
            var j = 0;
            var k = 0;
            tbody.children().each(function (i) {
                if (params.isRowSortable(i)) {
                    trsArrray[j] = $(this).clone(true, true);;
                    j++;
                }
                else {
                    if (trsExtendArray[k] == null) {
                        trsExtendArray[k] = new Array();
                        trsExtendArray[k][0] = $(this);

                    } else {
                        var l = trsExtendArray[k].length;
                        trsExtendArray[k][l] = $(this);
                    }
                    k++;
                }
            });

            quickSort(trsArrray, headerIndex, 0, trsArrray.length - 1, desc, trsExtendArray);
            tbody.empty();
            trsArrray.forEach(function (row, index, array) {
                tbody.append(row);
                if (trsExtendArray[index] != null) {
                    trsExtendArray[index].forEach(function (r) {
                        tbody.append(r);
                    });
                }
            });
            //resizeColumns(that, params);
        }

        function initSearch(thead, tbody) {
            params.searchInput.on("keydown", function (e) {
                if (e.keyCode != 13)
                    return null;
                return search(params.searchInput.val(), thead, tbody);

            });
        }

        function search(query, thead, tbody) {
            tbody.children().removeClass("hiddenBySearch").attr("itemrefs", "0");

            var columnNameToIndex = {};
            thead.children().children('th').each(function (i) {
                columnNameToIndex[$(this).children(".headerValue").html().toLowerCase().trim()] = i;
            });

            console.dir(columnNameToIndex);
            if (query != undefined && query != "") {
                tbody.children().each(function (i) {
                    if (params.isRowSortable(i) && !validateLine($(this), columnNameToIndex, query)) {
                        $(this).find("input[type=checkbox]").prop("checked", false);
                        params.onHideRow($(this));
                        $(this).addClass("hiddenBySearch");
                    }
                });
            }
        }

        function validateLine(line, columnNameToIndex, query) {
            var length = query.length;
            var firstBracket = query.indexOf("(");
            var lastBracket = -1;

            if (firstBracket != -1) {
                var opening = 1;
                var closing = 0;
                for (var i = firstBracket + 1; i < length; i++) {
                    if (query[i] == ')') closing++;
                    else if (query[i] == '(') opening++;

                    if (closing == opening) {
                        lastBracket = i;
                        break;
                    }
                }

                var before = query.substring(0, firstBracket);
                var subquery = query.substring(firstBracket + 1, lastBracket);
                var after = query.substring(lastBracket + 1, length);

                var nquery = before + validateLine(line, columnNameToIndex, subquery) + after;

                return validateLine(line, columnNameToIndex, nquery);
            } else {
                var nbFlagged = 0;
                var queryOrArray = query.split("OR");
                queryOrArray.forEach(function (subQueryOr, iOr, orArray) {
                    var queryAndArray = subQueryOr.split("AND");
                    var flagged = false;
                    queryAndArray.forEach(function (subQuery, iAnd, andArray) {
                        var key;
                        var value;
                        var compare;
                        var colIndex;
                        var queryArray = null;
                        if (subQuery.indexOf("==") > 0) {
                            queryArray = subQuery.split("==");
                            compare = function (a, b) { return a == b; };
                        } else if (subQuery.indexOf("!=") > 0) {
                            queryArray = subQuery.split("!=");
                            compare = function (a, b) { return a != b; };
                        } else if (subQuery.indexOf("<") > 0) {
                            queryArray = subQuery.split("<");
                            compare = function (a, b) { return a < b; };
                        } else if (subQuery.indexOf(">") > 0) {
                            queryArray = subQuery.split(">");
                            compare = function (a, b) { return a > b; };
                        } else if (subQuery.indexOf(">=") > 0) {
                            queryArray = subQuery.split(">=");
                            compare = function (a, b) { return a >= b; };
                        } else if (subQuery.indexOf("<=") > 0) {
                            queryArray = subQuery.split("<=");
                            compare = function (a, b) { return a <= b; };
                        } else if (subQuery.indexOf("true") >= 0) {
                            compare = function (a, b) { return true; };
                        } else if (subQuery.indexOf("false") >= 0) {
                            compare = function (a, b) { return false; };
                        } else {
                            return 0;
                        }

                        var key, value, isValidLine;
                        if (queryArray != null) {
                            key = queryArray[0].toLowerCase().trim();
                            value = queryArray[1].trim();
                            colIndex = columnNameToIndex[key];
                            isValidLine = line.children().size() > colIndex && compare(line.children(":eq(" + colIndex + ")").html().trim(), value)
                        } else {

                            isValidLine = compare(null, null);
                        }

                        if (!isValidLine) {
                            if (!flagged) {
                                flagged = true;
                                nbFlagged++;
                            }
                        }
                    });


                });

                if (nbFlagged != queryOrArray.length) return true;
                else return nbFlagged == 0;
            }
        }

        function quickSort(rowCollection, colSortedIndex, left, right, desc, extendedRowCollection) {
            var i = left;
            var j = right;
            var rand = left + Math.ceil(Math.random() * (right - left));
            var pivot = rowCollection[rand].children("td:eq(" + colSortedIndex + ")").html();
            while (i <= j) {
                if (desc) {
                    while (rowCollection[i].children("td:eq(" + colSortedIndex + ")").html() < pivot) {
                        i++;
                    }
                    while (rowCollection[j].children("td:eq(" + colSortedIndex + ")").html() > pivot) {
                        j--;
                    }
                } else {
                    while (rowCollection[i].children("td:eq(" + colSortedIndex + ")").html() > pivot) {
                        i++;
                    }
                    while (rowCollection[j].children("td:eq(" + colSortedIndex + ")").html() < pivot) {
                        j--;
                    }
                }

                if (i <= j) {
                    var tmp = rowCollection[i];
                    rowCollection[i] = rowCollection[j];
                    rowCollection[j] = tmp;
                    if (extendedRowCollection && extendedRowCollection.length > 0) {
                        tmp = extendedRowCollection[i];
                        extendedRowCollection[i] = extendedRowCollection[j];
                        extendedRowCollection[j] = tmp;
                    }

                    i++;
                    j--;
                }
            }

            if (left < j)
                quickSort(rowCollection, colSortedIndex, left, j, desc, extendedRowCollection);
            if (i < right)
                quickSort(rowCollection, colSortedIndex, i, right, desc, extendedRowCollection);
        }

        function resizeColumns(table, isScrolled) {
            var trs = table.children("tbody").children("tr:first-child");
            var theadTr = table.children("thead").children().first();
            var nbColumns = theadTr.children().size();
            trs.each(function (j) {
                
                //if (params.isRowSortable(j)) {
                $(this).children().each(function (i) {
                    var th = theadTr.children(":eq(" + i + ")");
                    var blWidth = th.css("borderLeftWidth") == undefined ? 0 : th.css("borderLeftWidth").replace("px", "");
                    var brWidth = th.css("borderRightWidth") == undefined ? 0 : th.css("borderLeftWidth").replace("px", "");
                    var width = th.innerWidth() + Math.max(blWidth, brWidth);

                    var padding = $(this).innerWidth() - $(this).width();

                    if (isScrolled && i == nbColumns-1) {
                        width -= 17;
                    }
                    $(this).width(width - padding);
                });
                //}
            });
        }

        function clearSelection() {
            if (document.selection && document.selection.empty) {
                document.selection.empty();
            } else if (window.getSelection) {
                var sel = window.getSelection();
                sel.removeAllRanges();
            }
        }

    };
})(jQuery);
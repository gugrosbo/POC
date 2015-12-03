// --------------------------------------------------------------------------------------------------------------------
// <copyright file="MobyForm.js" company="Microsoft">
//   
// </copyright>
// <summary>
//   JQuery plugin :
//   Defines a set of event based toold to better handle HTML5 forms using javascript
//   Provided feature includes :
//      - prevention of multisubmission
//      - AJAX submission
//      - default value
//      - custom radio buttons
//      - select button conditional associations
//      - conditional fields
// </summary>
// --------------------------------------------------------------------------------------------------------------------

(function ($) {
    $.fn.MobyForm = function (options) {
        var defaults =
        {
            lightBoxed: false,
            onFormComplete: function () { },
            onBeforeSubmit: function () { return true; },
            onSubmitComplete: function () { },
            filterFormBeforeSubmit: function (form) { return form; },
            validate: false,
            submitMode: "get"
        };

        var params = $.extend(defaults, options);

        return this.each(function () {
            var form = $(this);

            // form with this class will be submited when an input of the form is changed
            form.on("change", ".submitOnChange", function (e) {
                e.stopImmediatePropagation();
                form.trigger("submit");
            });

            // input with the data-defaultValue attribute will be set to this default value
            // focusing in the input will make the default value disapear
            // when the focus is lost the default value will be used again if the actual value is an empty string
            form.find("input[data-defaultValue]").each(function () {
                if ($(this).val() == "") {
                    $(this).val($(this).attr("data-defaultValue"));
                }
                $(this).on("focus", function () {
                    if ($(this).val() == $(this).attr("data-defaultValue"))
                        $(this).val("");
                });
                $(this).on("focusout", function () {
                    if ($(this).val() == "")
                        $(this).val($(this).attr("data-defaultValue"));
                });
            });

            // change the appearance of radio button to give them an azure style
            form.find("dd label>input[type=radio]").change(function () {
                var dd = $(this).closest("dd");
                dd.find("input[type=radio]:checked:not(.selectedRadio)").parent("label").addClass("selected");
                dd.find("input[type=radio]:not(:checked)").parent("label").removeClass("selected");
            });

            // change the appearance of checkbox button to give them an azure style
            form.find("dd label.onOffButton>input[type=checkbox]").change(function () {
                if ($(this).prop("checked")) {
                    $(this).parent("label").addClass("selected");
                } else {
                    $(this).parent("label").removeClass("selected");
                }
            });

            // inputs with the data-associatedFieldId attribute are conditionnals :
            // selecting an option in this field conditionate the options of the associated field
            // data-associatedFieldId can take this kind of values : fieldId1|fieldid2|FieldId3 ...
            // data-associatedKeys can take this kind of values : k1,k2,k3|k2,k6,k8|k4
            // where k1,k2,k3 are the values of options in field with id fieldId1
            // k2,k6,k8 are the values of options in field with id fieldId2
            // k4 are the values of options in field with id fieldId3
            // this allows to render many to many asssociation 
            var dynamicFieldAssociationChangeHandler = function () {
                var select = $(this);
                var origin;
                var isSelect = $(this).is("select");
                var isChecked = $(this).prop("checked");

                if (isSelect) {
                    origin = select.find("option:selected");
                } else {
                    origin = select;
                }
                var foreignFields = origin.attr("data-associatedFieldId").split('|');
                var allowedKeysGrouped;
                if (isSelect) {
                    allowedKeysGrouped = origin.attr("data-associatedKeys").split('|');
                } else {
                    if (isChecked) {
                        allowedKeysGrouped = origin.attr("data-associatedKeysChecked").split('|');
                    } else {
                        allowedKeysGrouped = origin.attr("data-associatedKeysUnChecked").split('|');
                    }
                }

                foreignFields.forEach(function (foreignFieldId, foreignFieldIndex) {
                    var foreignField = $("#" + foreignFieldId);
                    var allowedKeys = allowedKeysGrouped[foreignFieldIndex].split(',');

                    var originalContent = foreignField.attr('data-foreignFieldOriginalContent');

                    if (originalContent == undefined) {
                        originalContent = foreignField.html();
                        foreignField.attr('data-foreignFieldOriginalContent', originalContent);
                    } else {
                        foreignField.html(originalContent);
                    }

                    if (foreignField.prop("disabled")) {
                        foreignField.prop("disabled", false);
                    }

                    foreignField.find("option").each(function () {

                        if ($.inArray($(this).attr('value'), allowedKeys)==-1) {
                            $(this).remove();
                        }
                    });

                    foreignField.trigger("change");

                });
            };

            form.find("option[data-associatedFieldId]").closest("select").on("change", dynamicFieldAssociationChangeHandler);
            form.find("[data-associatedFieldId]:not(option)").on("change", dynamicFieldAssociationChangeHandler);
            form.find("option[data-associatedFieldId]").closest("select").trigger("change");
            form.find("[data-associatedFieldId]:not(option)").trigger("change");

            var submitInProgress = false;
            form.on("click","input[type=submit]", function() {
                form.find("input[type=submit][clicked]").removeAttr("clicked");
                $(this).attr("clicked", "clicked");
            })
            
            form.on("submit", function () {

                // prevent multi submit during the form javascript treatment
                if (submitInProgress) {
                    return false;
                }

                submitInProgress = true;

                // disable the submit buttons to avoid multi submission
                form.find("input[type=submit]").prop("disabled", true);

                // validate the form
                var formValid = true;
                form.find(".incorrectValue").removeClass("incorrectValue");
                form.find("input.mandatory").each(function () {
                    var input = $(this);
                    
                    // that way we can avoid the problem of mandatory field in OR fields 
                    if (!input.is(":visible")) {
                        return;
                    }
                    var validationRegex = input.attr("data-validationRegex") != undefined ? input.attr("data-validationRegex") : ".+";
                    var regex = new RegExp(validationRegex);
                    var val = input.val();

                    if (input.is("input[type=checkbox]")) {
                        val = "";
                        $("input[name=" + input.attr('name') + "]").each(function () {

                            val += $(this).prop("checked") ? $(this).val() : "";
                        });
                    }

                    if (val.match(regex) == null) {
                        input.addClass("incorrectValue");
                        formValid = false;

                        if (input.is("input[type=checkbox]") && input.next().is(".checkbox")) {
                            input.next().addClass("incorrectValue");
                        }
                    }
                });

                if (!params.onBeforeSubmit() || !formValid) {
                    form.find("input[type=submit]").prop("disabled", false);
                    return false;
                }

                // handle special data : they will be added as form data it self, not dependant of the input name attribute
                // eg : <input type="text" value="field1=0&field2=1" class="addValueAsFormData" /> will be converted to 
                // <input type="hidden" name="field1" value="0" />
                // <input type="hidden" name="field2" value="1" />
                $('input.addValueAsFormData').each(function () {
                    var val = $(this).val();
                    var params = val.split("&");
                    params.forEach(function (el) {
                        var t = el.indexOf("=");
                        var key = el.substring(0, t);
                        var val = el.substring(t + 1);
                        if (t != -1) {
                            form.append('<input type="hidden" class="hiddenAddValueAsFormData" name="' + key + '" value="' + val.replace(/\"/g, "&quot;") + '" />');
                        }
                    });
                    $(this).prop("disabled", true);
                });
                // hijack the submission of ajax form : send an ajax request instead
                if (form.hasClass("ajaxForm")) {
                    var ajaxFn;
                    var type;
                    if (form.attr("method").toUpperCase() === "POST") {
                        ajaxFn = $.post;
                        type = "POST";
                    }
                    if (form.attr("method").toUpperCase() === "PUT") {
                        type = "PUT";
                        ajaxFn = $.post;
                    } else {
                        type = "GET";
                        ajaxFn = $.get;
                    }
                    var triggeringButton = form.find("input[type=submit][clicked]");

                    var onSuccess = function (data) {
                        $('input.addValueAsFormData').prop("disabled", false);
                        $(".hiddenAddValueAsFormData").remove();
                        params.onSubmitComplete(data);
                        submitInProgress = false;
                        form.find("input[type=submit]").prop("disabled", false);
                    }

                    var data = params.submitMode == "json"
                        ? JSON.stringify(params.filterFormBeforeSubmit(form).serializeArray())
                        : params.filterFormBeforeSubmit(form).serialize();//+ "&" + triggeringButton.attr("name")+"="+triggeringButton.val()

                    $.ajax({
                        url: form.attr("action"),
                        type: type,
                        data: data,
                        success: onSuccess
                     });
                    return false;
                }
                
                return true;
            });

            // handle cancel button behavior
            form.on("click", "input.cancel", function () {
                $.colorbox.element().remove();
                $.colorbox.close();
                return false;
            });
            
            // handle conditionla appearance of inputs depending on a radio button
            // eg : selecting a value in a select button can make an input appear and another disapear
            // input with class default will be displayed if nothing is selected
            // input are to be displayed or hidden depending on the value of the radio button with class orMaster
            // todo use HTML5 data- like attribute instead of itemrefs
            form.find(".or.default").each(function () {
                var orArray = $(this).closest("dl").attr("itemref").split(' ');
                var orId = orArray[0];
                var orChoice = orArray[1];
                form.find(".orMaster[itemref=" + orId + "]").find("input#" + orChoice).attr("checked", "checked");

            });

            form.find("input[type=radio]:checked:not(.selected)").parent("label").addClass("selected");

            form.on("change", ".orMaster input[type=radio]", function () {
                var orId = $(this).closest("dl").attr("itemref");
                var orChoice = $(this).attr("id");
                form.find('dl[itemref~="' + orId + '"]:not(.orMaster)').hide();
                form.find('dl[itemref~="' + orId + '"][itemref~="' + orChoice + '"]').show();
            });

            params.onFormComplete();
        });
    };
})(jQuery);
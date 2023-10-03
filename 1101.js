function unique_name_657 () {
        // Get the name of the column that is being edited
        var colname = $(this).closest('tr').find('input:first').val();
        var title;
        var i;
        // And use it to make up a title for the page
        if (colname.length < 1) {
            title = PMA_messages.enum_newColumnVals;
        } else {
            title = PMA_messages.enum_columnVals.replace(
                /%s/,
                '"' + escapeHtml(decodeURIComponent(colname)) + '"'
            );
        }
        // Get the values as a string
        var inputstring = $(this)
            .closest('td')
            .find("input")
            .val();
        // Escape html entities
        inputstring = $('<div/>')
            .text(inputstring)
            .html();
        // Parse the values, escaping quotes and
        // slashes on the fly, into an array
        var values = [];
        var in_string = false;
        var curr, next, buffer = '';
        for (i = 0; i < inputstring.length; i++) {
            curr = inputstring.charAt(i);
            next = i == inputstring.length ? '' : inputstring.charAt(i + 1);
            if (! in_string && curr == "'") {
                in_string = true;
            } else if (in_string && curr == "\\" && next == "\\") {
                buffer += "&#92;";
                i++;
            } else if (in_string && next == "'" && (curr == "'" || curr == "\\")) {
                buffer += "&#39;";
                i++;
            } else if (in_string && curr == "'") {
                in_string = false;
                values.push(buffer);
                buffer = '';
            } else if (in_string) {
                buffer += curr;
            }
        }
        if (buffer.length > 0) {
            // The leftovers in the buffer are the last value (if any)
            values.push(buffer);
        }
        var fields = '';
        // If there are no values, maybe the user is about to make a
        // new list so we add a few for him/her to get started with.
        if (values.length === 0) {
            values.push('', '', '', '');
        }
        // Add the parsed values to the editor
        var drop_icon = PMA_getImage('b_drop.png');
        for (i = 0; i < values.length; i++) {
            fields += "<tr><td>" +
                   "<input type='text' value='" + values[i] + "'/>" +
                   "</td><td class='drop'>" +
                   drop_icon +
                   "</td></tr>";
        }
        /**
         * @var dialog HTML code for the ENUM/SET dialog
         */
        var dialog = "<div id='enum_editor'>" +
                   "<fieldset>" +
                    "<legend>" + title + "</legend>" +
                    "<p>" + PMA_getImage('s_notice.png') +
                    PMA_messages.enum_hint + "</p>" +
                    "<table class='values'>" + fields + "</table>" +
                    "</fieldset><fieldset class='tblFooters'>" +
                    "<table class='add'><tr><td>" +
                    "<div class='slider'></div>" +
                    "</td><td>" +
                    "<form><div><input type='submit' class='add_value' value='" +
                    $.sprintf(PMA_messages.enum_addValue, 1) +
                    "'/></div></form>" +
                    "</td></tr></table>" +
                    "<input type='hidden' value='" + // So we know which column's data is being edited
                    $(this).closest('td').find("input").attr("id") +
                    "' />" +
                    "</fieldset>" +
                    "</div>";
        /**
         * @var  Defines functions to be called when the buttons in
         * the buttonOptions jQuery dialog bar are pressed
         */
        var buttonOptions = {};
        buttonOptions[PMA_messages.strGo] = function () {
            // When the submit button is clicked,
            // put the data back into the original form
            var value_array = [];
            $(this).find(".values input").each(function (index, elm) {
                var val = elm.value.replace(/\\/g, '\\\\').replace(/'/g, "''");
                value_array.push("'" + val + "'");
            });
            // get the Length/Values text field where this value belongs
            var values_id = $(this).find("input[type='hidden']").val();
            $("input#" + values_id).val(value_array.join(","));
            $(this).dialog("close");
        };
        buttonOptions[PMA_messages.strClose] = function () {
            $(this).dialog("close");
        };
        // Show the dialog
        var width = parseInt(
            (parseInt($('html').css('font-size'), 10) / 13) * 340,
            10
        );
        if (! width) {
            width = 340;
        }
        $enum_editor_dialog = $(dialog).dialog({
            minWidth: width,
            modal: true,
            title: PMA_messages.enum_editor,
            buttons: buttonOptions,
            open: function () {
                // Focus the "Go" button after opening the dialog
                $(this).closest('.ui-dialog').find('.ui-dialog-buttonpane button:first').focus();
            },
            close: function () {
                $(this).remove();
            }
        });
        // slider for choosing how many fields to add
        $enum_editor_dialog.find(".slider").slider({
            animate: true,
            range: "min",
            value: 1,
            min: 1,
            max: 9,
            slide: function (event, ui) {
                $(this).closest('table').find('input[type=submit]').val(
                    $.sprintf(PMA_messages.enum_addValue, ui.value)
                );
            }
        });
        // Focus the slider, otherwise it looks nearly transparent
        $('a.ui-slider-handle').addClass('ui-state-focus');
        return false;
    }
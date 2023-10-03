function unique_name_660 (event) {
        event.preventDefault();
        /**
         * @var question    String containing the question to be asked for confirmation
         */
        var question = PMA_messages.strTruncateTableStrongWarning + ' ';
        question += $.sprintf(
            PMA_messages.strDoYouReally,
            'TRUNCATE ' + escapeHtml(PMA_commonParams.get('table'))
        );
        $(this).PMA_confirm(question, $(this).attr('href'), function (url) {
            PMA_ajaxShowMessage(PMA_messages.strProcessingRequest);
            $.get(url, {'is_js_confirmed': '1', 'ajax_request': true}, function (data) {
                if ($("#sqlqueryresults").length !== 0) {
                    $("#sqlqueryresults").remove();
                }
                if ($("#result_query").length !== 0) {
                    $("#result_query").remove();
                }
                if (data.success === true) {
                    PMA_ajaxShowMessage(data.message);
                    $("<div id='sqlqueryresults'></div>").prependTo("#page_content");
                    $("#sqlqueryresults").html(data.sql_query);
                    PMA_highlightSQL($('#page_content'));
                } else {
                    PMA_ajaxShowMessage(data.error, false);
                }
            }); // end $.get()
        }); // end $.PMA_confirm()
    }
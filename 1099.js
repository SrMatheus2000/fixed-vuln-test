function unique_name_655 (event) {
        event.preventDefault();
        /**
         * @var question    String containing the question to be asked for confirmation
         */
        var question = PMA_messages.strDropTableStrongWarning + ' ';
        question += $.sprintf(
            PMA_messages.strDoYouReally,
            'DROP VIEW ' + escapeHtml(PMA_commonParams.get('table'))
        );

        $(this).PMA_confirm(question, $(this).attr('href'), function (url) {

            var $msgbox = PMA_ajaxShowMessage(PMA_messages.strProcessingRequest);
            $.get(url, {'is_js_confirmed': '1', 'ajax_request': true}, function (data) {
                if (data.success === true) {
                    PMA_ajaxRemoveMessage($msgbox);
                    // Table deleted successfully, refresh both the frames
                    PMA_reloadNavigation();
                    PMA_commonParams.set('table', '');
                    PMA_commonActions.refreshMain(
                        PMA_commonParams.get('opendb_url'),
                        function () {
                            PMA_ajaxShowMessage(data.message);
                        }
                    );
                } else {
                    PMA_ajaxShowMessage(data.error, false);
                }
            }); // end $.get()
        }); // end $.PMA_confirm()
    }
function unique_name_643(event) {
        event.preventDefault();

        //context is top.frame_content, so we need to use window.parent.db to access the db var
        /**
         * @var question    String containing the question to be asked for confirmation
         */
        var question = PMA_messages['strDropDatabaseStrongWarning'] + '\n' + PMA_messages['strDoYouReally'] + ' :\n' + 'DROP DATABASE ' + escapeHtml(window.parent.db);

        $(this).PMA_confirm(question, $(this).attr('href') ,function(url) {

            PMA_ajaxShowMessage(PMA_messages['strProcessingRequest']);
            $.get(url, {'is_js_confirmed': '1', 'ajax_request': true}, function(data) {
                //Database deleted successfully, refresh both the frames
                window.parent.refreshNavigation();
                window.parent.refreshMain();
            }) // end $.get()
        }); // end $.PMA_confirm()
    }
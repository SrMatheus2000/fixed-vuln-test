function unique_name_187(event) {
        try {
            var msg = "";

            msg += "<div>";
            msg += event.message;
            msg += "</div>";

            msg += " <div class=\"noVNC_location\">";
            msg += event.filename;
            msg += ":" + event.lineno + ":" + event.colno;
            msg += "</div>";

            if ((event.error !== undefined) &&
                (event.error.stack !== undefined)) {
                msg += "<div class=\"noVNC_stack\">";
                msg += event.error.stack;
                msg += "</div>";
            }

            document.getElementById('noVNC_fallback_error')
                .classList.add("noVNC_open");
            document.getElementById('noVNC_fallback_errormsg').textContent = msg;
        } catch (exc) {
            document.write("noVNC encountered an error.");
        }
        // Don't return true since this would prevent the error
        // from being printed to the browser console.
        return false;
    }
function unique_name_186(text, status_type, time) {
            var statusElem = document.getElementById('noVNC_status');

            clearTimeout(UI.statusTimeout);

            if (typeof status_type === 'undefined') {
                status_type = 'normal';
            }

            statusElem.classList.remove("noVNC_status_normal",
                                        "noVNC_status_warn",
                                        "noVNC_status_error");

            switch (status_type) {
                case 'warning':
                case 'warn':
                    statusElem.classList.add("noVNC_status_warn");
                    break;
                case 'error':
                    statusElem.classList.add("noVNC_status_error");
                    break;
                case 'normal':
                case 'info':
                default:
                    statusElem.classList.add("noVNC_status_normal");
                    break;
            }

            statusElem.textContent = text;
            statusElem.classList.add("noVNC_open");

            // If no time was specified, show the status for 1.5 seconds
            if (typeof time === 'undefined') {
                time = 1500;
            }

            // Error messages do not timeout
            if (status_type !== 'error') {
                UI.statusTimeout = window.setTimeout(UI.hideStatus, time);
            }
        }
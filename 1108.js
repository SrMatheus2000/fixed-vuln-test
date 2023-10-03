function unique_name_664 (name, value) {
            if (name == 'user_host') {
                return value.replace(/(\[.*?\])+/g, '');
            }
            return escapeHtml(value);
        }
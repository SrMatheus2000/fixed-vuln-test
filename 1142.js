function unique_name_685(e) {
                // Allow the default browser action when the user holds a modifier (e.g., Ctrl-Click)
                if(e.altKey || e.metaKey || e.shiftKey) {
                    return true;
                }
                var path = '';
                window.history.pushState(
                    {path: path},
                    'Home',
                    utils.url_path_join(that.base_url, 'tree')
                );
                that.update_location(path);
                return false;
            }
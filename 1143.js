function unique_name_686(path_part) {
            path_parts.push(path_part);
            var path = path_parts.join('/');
            var url = utils.url_path_join(
                that.base_url,
                '/tree',
                utils.encode_uri_components(path)
            );
            var crumb = $('<li/>').append(
                $('<a/>')
                .attr('href', url)
                .text(path_part)
                .click(function(e) {
                    // Allow the default browser action when the user holds a modifier (e.g., Ctrl-Click)
                    if(e.altKey || e.metaKey || e.shiftKey) {
                        return true;
                    }
                    window.history.pushState(
                        {path: path},
                        path,
                        url
                    );
                    that.update_location(path);
                    return false;
                })
            );
            breadcrumb.append(crumb);
        }
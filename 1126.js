function dismissChangeRelatedObjectPopup(win, objId, newRepr, newId) {
        objId = html_unescape(objId);
        newRepr = html_unescape(newRepr);
        var id = windowname_to_id(win.name).replace(/^edit_/, '');
        var selectsSelector = interpolate('#%s, #%s_from, #%s_to', [id, id, id]);
        var selects = django.jQuery(selectsSelector);
        selects.find('option').each(function() {
            if (this.value === objId) {
                this.textContent = newRepr;
                this.value = newId;
            }
        });
        win.close();
    }
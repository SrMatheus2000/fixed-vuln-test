function unique_name_630() {
    /**
     * Vertical marker
     */
    $('.vmarker').live('click', function(e) {
        // do not trigger when clicked on anchor
        if ($(e.target).is('a, img, a *')) {
            return;
        }

        var $this_td = $(this);
        var row_num = PMA_getRowNumber($this_td.attr('class'));

        // XXX: FF fires two click events for <label> (label and checkbox), so we need to handle this differently
        var $tr = $(this);
        var $checkbox = $('.vmarker').filter('.row_' + row_num + ':first').find(':checkbox');
        if ($checkbox.length) {
            // checkbox in a row, add or remove class depending on checkbox state
            var checked = $checkbox.attr('checked');
            if (!$(e.target).is(':checkbox, label')) {
                checked = !checked;
                $checkbox.attr('checked', checked);
            }
            // for all td of the same vertical row, toggle the marked class
            if (checked) {
                $('.vmarker').filter('.row_' + row_num).addClass('marked');
            } else {
                $('.vmarker').filter('.row_' + row_num).removeClass('marked');
            }
        } else {
            // normaln data table, just toggle class
            $('.vmarker').filter('.row_' + row_num).toggleClass('marked');
        }
    });

    /**
     * Reveal visual builder anchor
     */

    $('#visual_builder_anchor').show();

    /**
     * Page selector in db Structure (non-AJAX)
     */
    $('#tableslistcontainer').find('#pageselector').live('change', function() {
        $(this).parent("form").submit();
    });

    /**
     * Page selector in navi panel (non-AJAX)
     */
    $('#navidbpageselector').find('#pageselector').live('change', function() {
        $(this).parent("form").submit();
    });

    /**
     * Page selector in browse_foreigners windows (non-AJAX)
     */
    $('#body_browse_foreigners').find('#pageselector').live('change', function() {
        $(this).closest("form").submit();
    });

    /**
     * Load version information asynchronously.
     */
    if ($('.jsversioncheck').length > 0) {
        $.getJSON('http://www.phpmyadmin.net/home_page/version.json', {}, PMA_current_version);
    }

    /**
     * Slider effect.
     */
    PMA_init_slider();

    /**
     * Enables the text generated by PMA_linkOrButton() to be clickable
     */
    $('a[class~="formLinkSubmit"]').live('click',function(e) {

        if($(this).attr('href').indexOf('=') != -1) {
            var data = $(this).attr('href').substr($(this).attr('href').indexOf('#')+1).split('=',2);
            $(this).parents('form').append('<input type="hidden" name="' + data[0] + '" value="' + data[1] + '"/>');
        }
        $(this).parents('form').submit();
        return false;
    });

    $('#update_recent_tables').ready(function() {
        if (window.parent.frame_navigation != undefined
            && window.parent.frame_navigation.PMA_reloadRecentTable != undefined)
        {
            window.parent.frame_navigation.PMA_reloadRecentTable();
        }
    });

}
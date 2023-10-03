function unique_name_642() {
        // Inline edit post has been successful.
        $this_sibling = $(this);

        var is_null = $this_sibling.find('input:checkbox').is(':checked');
        if (is_null) {
            $this_sibling.html('NULL');
            $this_sibling.addClass('null');
        } else {
            $this_sibling.removeClass('null');
            if($this_sibling.is(':not(.relation, .enum, .set)')) {
                /**
                 * @var new_html    String containing value of the data field after edit
                 */
                var new_html = $this_sibling.find('textarea').val();

                if($this_sibling.is('.transformed')) {
                    var field_name = getFieldName($this_sibling, disp_mode);
                    if (typeof data.transformations != 'undefined') {
                        $.each(data.transformations, function(key, value) {
                            if(key == field_name) {
                                if($this_sibling.is('.text_plain, .application_octetstream')) {
                                    new_html = value;
                                    return false;
                                } else {
                                    var new_value = $this_sibling.find('textarea').val();
                                    new_html = $(value).append(new_value);
                                    return false;
                                }
                            }
                        })
                    }
                }
            } else {
                var new_html = '';
                var new_value = '';
                $test_element = $this_sibling.find('select');
                if ($test_element.length != 0) {
                    new_value = $test_element.val();
                }
                $test_element = $this_sibling.find('span.curr_value');
                if ($test_element.length != 0) {
                    new_value = $test_element.text();
                }

                if($this_sibling.is('.relation')) {
                    var field_name = getFieldName($this_sibling, disp_mode);
                    if (typeof data.relations != 'undefined') {
                        $.each(data.relations, function(key, value) {
                            if(key == field_name) {
                                new_html = $(value);
                                return false;
                            }
                        })
                    }
                } else if ($this_sibling.is('.enum')) {
                    new_html = new_value;
                } else if ($this_sibling.is('.set')) {
                    if (new_value != null) {
                        $.each(new_value, function(key, value) {
                            new_html = new_html + value + ',';
                        })
                        new_html = new_html.substring(0, new_html.length-1);
                    }
                }
            }
            $this_sibling.text(new_html);
        }
    }
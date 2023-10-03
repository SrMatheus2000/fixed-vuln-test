function unique_name_663 (key, value) {
                    value = (value === null) ? 'null' : escapeHtml(value);

                    if (key == 'type' && value.toLowerCase() == 'all') {
                        value = '<span class="attention">' + value + '</span>';
                    }
                    if (key == 'Extra') {
                        value = value.replace(/(using (temporary|filesort))/gi, '<span class="attention">$1</span>');
                    }
                    explain += key + ': ' + value + '<br />';
                }
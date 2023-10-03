function unique_name_286 ( i, option ) {
                var item = this.items[option.idx];
                var matches = compare( option.textContent.trim().toLowerCase(), string );

                if ( matches && !option.disabled ) {
                    results.push( { text: option.textContent, value: option.value } );
                    if ( live ) {
                        appendItem( item, f, this.customOption );
                        util.removeClass( item, "excluded" );

                        // Underline the matching results
                        if ( !this.customOption ) {
                            match( string, option );
                        }
                    }
                } else if ( live ) {
                    util.addClass( item, "excluded" );
                }
            }
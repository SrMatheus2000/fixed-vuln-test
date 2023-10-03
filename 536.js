function unique_name_287( string, anchor ) {
        if ( this.navigating ) {
            return;
        }

        // we're only going to alter the DOM for "live" searches
        var live = false;
        if ( ! string ) {
            string = this.input.value;
            live = true;

            // Remove message and clear dropdown
            this.removeMessage();
            util.truncate(this.tree);
        }
        var results = [];
        var f = document.createDocumentFragment();

        string = string.trim().toLowerCase();

        if ( string.length > 0 ) {
            var compare = anchor ? util.startsWith : util.includes;

            util.each( this.options, function ( i, option ) {
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
            }, this);

            if ( live ) {
                // Append results
                if ( !f.childElementCount ) {
                    if ( !this.config.taggable ) {
                        this.noResults = true;
                        this.setMessage( this.config.messages.noResults );
                    }
                } else {
                    // Highlight top result (@binary-koan #26)
                    var prevEl = this.items[this.navIndex];
                    var firstEl = f.querySelector(".selectr-option:not(.excluded)");
                    this.noResults = false;

                    util.removeClass( prevEl, "active" );
                    this.navIndex = firstEl.idx;
                    util.addClass( firstEl, "active" );
                }

                this.tree.appendChild( f );
            }
        } else {
            render.call(this);
        }

        return results;
    }
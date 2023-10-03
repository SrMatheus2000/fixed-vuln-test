function unique_name_496 ( html, isPaste ) {
    var range = this.getSelection();
    var doc = this._doc;
    var startFragmentIndex, endFragmentIndex;
    var div, frag, root, node, event;

    // Edge doesn't just copy the fragment, but includes the surrounding guff
    // including the full <head> of the page. Need to strip this out. If
    // available use DOMPurify to parse and sanitise.
    if ( typeof DOMPurify !== 'undefined' && DOMPurify.isSupported ) {
        frag = DOMPurify.sanitize( html, {
            WHOLE_DOCUMENT: false,
            RETURN_DOM: true,
            RETURN_DOM_FRAGMENT: true
        });
        frag = doc.importNode( frag, true );
    } else {
        if ( isPaste ) {
            startFragmentIndex = html.indexOf( '<!--StartFragment-->' );
            endFragmentIndex = html.lastIndexOf( '<!--EndFragment-->' );
            if ( startFragmentIndex > -1 && endFragmentIndex > -1 ) {
                html = html.slice( startFragmentIndex + 20, endFragmentIndex );
            }
        }
        // Parse HTML into DOM tree
        div = this.createElement( 'DIV' );
        div.innerHTML = html;
        frag = doc.createDocumentFragment();
        frag.appendChild( empty( div ) );
    }

    // Record undo checkpoint
    this.saveUndoState( range );

    try {
        root = this._root;
        node = frag;
        event = {
            fragment: frag,
            preventDefault: function () {
                this.defaultPrevented = true;
            },
            defaultPrevented: false
        };

        addLinks( frag, frag, this );
        cleanTree( frag );
        cleanupBRs( frag, null );
        removeEmptyInlines( frag );
        frag.normalize();

        while ( node = getNextBlock( node, frag ) ) {
            fixCursor( node, null );
        }

        if ( isPaste ) {
            this.fireEvent( 'willPaste', event );
        }

        if ( !event.defaultPrevented ) {
            insertTreeFragmentIntoRange( range, event.fragment, root );
            if ( !canObserveMutations ) {
                this._docWasChanged();
            }
            range.collapse( false );
            this._ensureBottomLine();
        }

        this.setSelection( range );
        this._updatePath( range, true );
    } catch ( error ) {
        this.didError( error );
    }
    return this;
}
function unique_name_590() {
				var data = {};

				// Collect data from fields.
				this.commitContent( data );

				var selection = editor.getSelection(),
					attributes = plugin.getLinkAttributes( editor, data ),
					bm,
					nestedLinks;

				if ( !this._.selectedElement ) {
					var range = selection.getRanges()[ 0 ],
						text;

					// Use link URL as text with a collapsed cursor.
					if ( range.collapsed ) {
						// Short mailto link text view (#5736).
						text = new CKEDITOR.dom.text( data.linkText || ( data.type == 'email' ?
							data.email.address : attributes.set[ 'data-cke-saved-href' ] ), editor.document );
						range.insertNode( text );
						range.selectNodeContents( text );
					} else if ( initialLinkText !== data.linkText ) {
						text = new CKEDITOR.dom.text( data.linkText, editor.document );

						bm = range.createBookmark();

						range.deleteContents( true );
						text.insertBefore( bm.startNode );
						// Use moveToBookmark to remove bookmark spans.
						range.moveToBookmark( bm );

						range.selectNodeContents( text );
					}

					// Editable links nested within current range should be removed, so that the link is applied to whole selection.
					nestedLinks = range._find( 'a' );

					for	( var i = 0; i < nestedLinks.length; i++ ) {
						nestedLinks[ i ].remove( true );
					}

					// Apply style.
					var style = new CKEDITOR.style( {
						element: 'a',
						attributes: attributes.set
					} );

					style.type = CKEDITOR.STYLE_INLINE; // need to override... dunno why.
					style.applyToRange( range, editor );
					range.select();
				} else {
					// We're only editing an existing link, so just overwrite the attributes.
					var element = this._.selectedElement,
						href = element.data( 'cke-saved-href' ),
						textView = element.getHtml(),
						newText;

					element.setAttributes( attributes.set );
					element.removeAttributes( attributes.removed );

					if ( data.linkText && initialLinkText != data.linkText ) {
						// Display text has been changed.
						newText = data.linkText;
					} else if ( href == textView || data.type == 'email' && textView.indexOf( '@' ) != -1 ) {
						// Update text view when user changes protocol (#4612).
						// Short mailto link text view (#5736).
						newText = data.type == 'email' ? data.email.address : attributes.set[ 'data-cke-saved-href' ];
					}

					if ( newText ) {
						element.setText( newText );
						// We changed the content, so need to select it again.
						selection.selectElement( element );
					}

					delete this._.selectedElement;
				}
			}
function addClickFn( color, colorName, colorbox ) {
						editor.focus();
						editor.fire( 'saveSnapshot' );

						if ( color == '?' ) {
							editor.getColorFromDialog( function( color ) {
								if ( ColorBox.validateColor( color ) ) {
									setColor( color, colorName, history );
								}
							}, null, colorData );
						} else {
							setColor( color && '#' + color, colorName, history );
						}

						// The colors may be duplicated in both default palette and color history. If user reopens panel
						// after choosing color without changing selection, the box that was clicked last should be selected.
						// If selection changes in the meantime, color box from the default palette has the precedence.
						// See https://github.com/ckeditor/ckeditor4/pull/3784#pullrequestreview-378461341 for details.
						if ( !colorbox ) {
							return;
						}
						colorbox.setAttribute( 'cke_colorlast', true );
						editor.once( 'selectionChange', function() {
							colorbox.removeAttribute( 'cke_colorlast' );
						} );
					}
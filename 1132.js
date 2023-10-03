function unique_name_677( key, val ) {
				var span, xbutton;

				val = $.trim( val );

				if ( ! val )
					return;

				// Create a new span, and ensure the text is properly escaped.
				span = $('<span />').text( val );

				// If tags editing isn't disabled, create the X button.
				if ( ! disabled ) {
					/*
					 * Build the X buttons, hide the X icon with aria-hidden and
					 * use visually hidden text for screen readers.
					 */
					xbutton = $( '<button type="button" id="' + id + '-check-num-' + key + '" class="ntdelbutton">' +
						'<span class="remove-tag-icon" aria-hidden="true"></span>' +
						'<span class="screen-reader-text">' + window.tagsSuggestL10n.removeTerm + ' ' + span.html() + '</span>' +
						'</button>' );

					xbutton.on( 'click keypress', function( e ) {
						// On click or when using the Enter/Spacebar keys.
						if ( 'click' === e.type || 13 === e.keyCode || 32 === e.keyCode ) {
							/*
							 * When using the keyboard, move focus back to the
							 * add new tag field. Note: when releasing the pressed
							 * key this will fire the `keyup` event on the input.
							 */
							if ( 13 === e.keyCode || 32 === e.keyCode ) {
 								$( this ).closest( '.tagsdiv' ).find( 'input.newtag' ).focus();
 							}

							tagBox.userAction = 'remove';
							tagBox.parseTags( this );
						}
					});

					span.prepend( '&nbsp;' ).prepend( xbutton );
				}

				// Append the span to the tag list.
				tagchecklist.append( span );
			}
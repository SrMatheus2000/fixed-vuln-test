function unique_name_545() {
			var title = $( this ).attr( "title" );
			// Escape title, since we're going from an attribute to raw HTML
			return $( "<a>" ).text( title ).html();
		}
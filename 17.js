function cleanListItem( evt, data, conversionApi ) {
	if ( conversionApi.consumable.test( data.viewItem, { name: true } ) ) {
		if ( data.viewItem.childCount === 0 ) {
			return;
		}

		const children = [ ...data.viewItem.getChildren() ];

		let foundList = false;
		let firstNode = true;

		for ( const child of children ) {
			if ( foundList && !isList( child ) ) {
				child._remove();
			}

			if ( child.is( '$text' ) ) {
				// If this is the first node and it's a text node, left-trim it.
				if ( firstNode ) {
					child._data = child.data.trimStart();
				}

				// If this is the last text node before <ul> or <ol>, right-trim it.
				if ( !child.nextSibling || isList( child.nextSibling ) ) {
					child._data = child.data.trimEnd();
				}
			} else if ( isList( child ) ) {
				// If this is a <ul> or <ol>, do not process it, just mark that we already visited list element.
				foundList = true;
			}

			firstNode = false;
		}
	}
}
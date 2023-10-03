function normalizeSpacing( htmlString ) {
	// Run normalizeSafariSpaceSpans() two times to cover nested spans.
	return normalizeSafariSpaceSpans( normalizeSafariSpaceSpans( htmlString ) )
		// Remove all \r\n from "spacerun spans" so the last replace line doesn't strip all whitespaces.
		.replace( /(<span\s+style=['"]mso-spacerun:yes['"]>[^\S\r\n]*?)[\r\n]+([^\S\r\n]*<\/span>)/g, '$1$2' )
		.replace( /<span\s+style=['"]mso-spacerun:yes['"]><\/span>/g, '' )
		.replace( / <\//g, '\u00A0</' )
		.replace( / <o:p><\/o:p>/g, '\u00A0<o:p></o:p>' )
		// Remove <o:p> block filler from empty paragraph. Safari uses \u00A0 instead of &nbsp;.
		.replace( /<o:p>(&nbsp;|\u00A0)<\/o:p>/g, '' )
		// Remove all whitespaces when they contain any \r or \n.
		.replace( />([^\S\r\n]*[\r\n]\s*)</g, '><' );
}
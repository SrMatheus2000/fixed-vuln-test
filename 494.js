function unique_name_265(html) {
  if (!SAFE_PARSING_SUPPORTED) {
    return '';
  }

  var newTree = this.processToTree(html);
  if (noclobber.getElementAttributes(newTree).length > 0) {
    // We want to preserve the outer SPAN tag, because the processor has
    // attached attributes to it. To do so, we make a new SPAN tag the parent of
    // the existing root span tag, so that the rest of the function will remove
    // that one instead.
    var newRoot = googDom.createElement(TagName.SPAN);
    newRoot.appendChild(newTree);
    newTree = newRoot;
  }

  // Serialized string of the sanitized DOM without root span tag
  return newTree.innerHTML;
}
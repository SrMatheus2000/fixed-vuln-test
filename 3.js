function htmlEncode(text) {
  // return document.createElement('a').appendChild( document.createTextNode(text) ).parentNode.innerHTML;
  return String(text).replace(/[<>&" ]/g, (c) => {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', ' ': '&nbsp;' }[c];
  });
}
function createHtmlText(tokens) {
  var htmlText = '';

  tokens.forEach(function(t) {
    if (t.matched) {
      htmlText += '<strong class="' + SearchPad.RESULT_HIGHLIGHT_CLASS + '">' + escapeHTML(t.matched) + '</strong>';
    } else {
      htmlText += escapeHTML(t.normal);
    }
  });

  return htmlText !== '' ? htmlText : null;
}
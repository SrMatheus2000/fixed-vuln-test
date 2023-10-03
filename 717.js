function foldLine (str, maxLen) {
  maxLen = maxLen || 76;

  var lines = [];
  var curLine = '';
  var pos = 0;
  var len = str.length;
  var match;

  while (pos < len) {
    curLine = str.substr(pos, maxLen);

    // ensure that the line never ends with a partial escaping
    // make longer lines if needed
    while (curLine.substr(-1) === '\\' && pos + curLine.length < len) {
      curLine += str.charAt(pos + curLine.length);
    }

    // ensure that if possible, line breaks are done at reasonable places
    if ((match = /.*?\\n/.exec(curLine))) {
      // use everything before and including the first line break
      curLine = match[0];
    } else if (pos + curLine.length < len) {
      // if we're not at the end
      if ((match = /.*\s+/.exec(curLine)) && /[^\s]/.test(match[0])) {
        // use everything before and including the last white space character (if anything)
        curLine = match[0];
      } else if ((match = /.*[\x21-\x2f0-9\x5b-\x60\x7b-\x7e]+/.exec(curLine)) && /[^\x21-\x2f0-9\x5b-\x60\x7b-\x7e]/.test(match[0])) {
        // use everything before and including the last "special" character (if anything)
        curLine = match[0];
      }
    }

    lines.push(curLine);
    pos += curLine.length;
  }

  return lines;
}
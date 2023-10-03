function applyReplacement(str, replacementHash, nestedKey, options) {
    if (!str) return str;

    options = options || replacementHash; // first call uses replacement hash combined with options
    if (str.indexOf(options.interpolationPrefix || o.interpolationPrefix) < 0) return str;

    var prefix = options.interpolationPrefix ? f.regexEscape(options.interpolationPrefix) : o.interpolationPrefixEscaped
      , suffix = options.interpolationSuffix ? f.regexEscape(options.interpolationSuffix) : o.interpolationSuffixEscaped
      , unEscapingSuffix = 'HTML'+suffix;

    var hash = replacementHash.replace && typeof replacementHash.replace === 'object' ? replacementHash.replace : replacementHash;
    var replacementRegex = new RegExp([prefix, '(.+?)', '(HTML)?', suffix].join(''), 'g');
    var escapeInterpolation = options.escapeInterpolation || o.escapeInterpolation;
    return str.replace(replacementRegex, function (wholeMatch, keyMatch, htmlMatched) {
        // Check for recursive matches of object
        var objectMatching = hash;
        var keyLeaf = keyMatch;
        while (keyLeaf.indexOf(o.keyseparator) >= 0 && typeof objectMatching === 'object' && objectMatching) {
            var propName = keyLeaf.slice(0, keyLeaf.indexOf(o.keyseparator));
            keyLeaf = keyLeaf.slice(keyLeaf.indexOf(o.keyseparator) + 1);
            objectMatching = objectMatching[propName];
        }
        if (objectMatching && typeof objectMatching === 'object' && objectMatching.hasOwnProperty(keyLeaf)) {
                var value = objectMatching[keyLeaf];
            if (escapeInterpolation && !htmlMatched) {
                return f.escape(objectMatching[keyLeaf]);
            } else {
                return objectMatching[keyLeaf];
            }
        } else {
            return wholeMatch;
        }
    });
}
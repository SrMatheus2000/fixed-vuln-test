function slug(string, opts) {
    string = string.toString();
    if ('string' === typeof opts)
        opts = {replacement:opts};
    opts = opts || {};
    opts.mode = opts.mode || slug.defaults.mode;
    var defaults = slug.defaults.modes[opts.mode];
    var keys = ['replacement','multicharmap','charmap','remove','lower'];
    for (var key, i = 0, l = keys.length; i < l; i++) { key = keys[i];
        opts[key] = (key in opts) ? opts[key] : defaults[key];
    }
    if ('undefined' === typeof opts.symbols)
        opts.symbols = defaults.symbols;

    var lengths = [];
    for (var key in opts.multicharmap) {
        if (!opts.multicharmap.hasOwnProperty(key))
            continue;

        var len = key.length;
        if (lengths.indexOf(len) === -1)
            lengths.push(len);
    }

    var code, unicode, result = "";
    for (var char, i = 0, l = string.length; i < l; i++) { char = string[i];
        if (!lengths.some(function (len) {
            var str = string.substr(i, len);
            if (opts.multicharmap[str]) {
                i += len - 1;
                char = opts.multicharmap[str];
                return true;
            } else return false;
        })) {
            if (opts.charmap[char]) {
                char = opts.charmap[char];
                code = char.charCodeAt(0);
            } else {
                code = string.charCodeAt(i);
            }
            if (opts.symbols && (unicode = symbols(code))) {
                char = unicode.name.toLowerCase();
                for(var j = 0, rl = removelist.length; j < rl; j++) {
                    char = char.replace(removelist[j], '');
                }
                char = char.replace(/^\s+|\s+$/g, '');
            }
        }
        char = char.replace(/[^\w\s\-\.\_~]/g, ''); // allowed
        if (opts.remove) char = char.replace(opts.remove, ''); // add flavour
        result += char;
    }
    result = result.trim();
    result = result.replace(/[-\s]+/g, opts.replacement); // convert spaces
    result = result.replace(opts.replacement+"$",''); // remove trailing separator
    if (opts.lower)
      result = result.toLowerCase();
    return result;
}
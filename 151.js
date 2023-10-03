function deepSet(parent, key, value, mode) {
    // if(typeof value==='string') value = value.replace(/(\r\n|\r|\n)\s*$/, ''); // replace line endings and white spaces
    var parts = key.split('.');
    var current = parent;
    if(key==='this') {
        if(mode==='push') parent.push(value);
        else parent = value.toString();
    }
    else {
        for(var i=0; i<parts.length; i++) {
            if(parts[i] === 'prototype' || parts[i] === '__proto__') throw new Error('Cannot use deepSet to override prototype !');

            if(i >= parts.length-1) {
                if(mode==='push') current[parts[i]].push(value);
                else current[parts[i]] = value;
            }
            else current[parts[i]] = current[parts[i]] || {};
            current = current[parts[i]];
        }
    }
    return parent;
}
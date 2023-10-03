function deepCopy(sourceObj, destinationObj) {
    var out = destinationObj || Object.create(null);
    Object.keys(sourceObj).forEach(function (key) {
        if (typeof sourceObj[key] === 'object') {
            out[key] = (util.isArray(sourceObj[key]) ? [] : Object.create(null));
            deepCopy(sourceObj[key], out[key]);
        } else {
            out[key] = sourceObj[key];
        }
    });

    return out;
}
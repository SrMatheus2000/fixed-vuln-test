function sanitizePath(id, name, callback) {
    if (name[0] === '/') name = name.substring(1);

    if (!id) {
        if (typeof callback === 'function') {
            callback('Empty ID');
        }
        return;
    }

    if (id) {
        id = id.replace(/[\]\[*,;'"`<>\\?\/]/g, ''); // remove all invalid characters from states plus slashes
    }

    if (name.includes('..')) {
        name = path.normalize('/' + name);
        name = name.replace(/\\/g, '/');
    }
    if (name.includes('..')) {
        // Also after normalization we still have .. in it - should not happen if normalize worked correctly
        name = name.replace(/\.\./g, '');
        name = path.normalize('/' + name);
        name = name.replace(/\\/g, '/');
    }
    if (name[0] === '/') name = name.substring(1); // do not allow absolute paths

    return {id: id, name: name};
}
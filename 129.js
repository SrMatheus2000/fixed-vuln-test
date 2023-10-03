function _setPath(document, keyPath, value) {
    if (!document) {
        throw new Error('No document was provided.');
    }

    let {indexOfDot, currentKey, remainingKeyPath} = computeStateInformation(keyPath);

    if (indexOfDot >= 0) {
        // If there is a '.' in the keyPath, recur on the subdoc and ...
        if (!document[currentKey] && Array.isArray(document)) {
            // If this is an array and there are multiple levels of keys to iterate over, recur.
            return document.forEach((doc) => _setPath(doc, keyPath, value));
        } else if (!document[currentKey]) {
            // If the currentKey doesn't exist yet, populate it
            document[currentKey] = {};
        }
        _setPath(document[currentKey], remainingKeyPath, value);
    } else if (Array.isArray(document)) {
        // If this "document" is actually an array, then we can loop over each of the values and set the path
        return document.forEach((doc) => _setPath(doc, remainingKeyPath, value));
    } else {
        // Otherwise, we can set the path directly
        document[keyPath] = value;
    }

    return document;
}
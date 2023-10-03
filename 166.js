function unSet(obj, path) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var tracking = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var internalPath = path;
  options = _objectSpread({
    "transformRead": returnWhatWasGiven,
    "transformKey": returnWhatWasGiven,
    "transformWrite": returnWhatWasGiven
  }, options); // No object data

  if (obj === undefined || obj === null) {
    return;
  } // No path string


  if (!internalPath) {
    return;
  }

  internalPath = clean(internalPath); // Path is not a string, throw error

  if (typeof internalPath !== "string") {
    throw new Error("Path argument must be a string");
  }

  if ((0, _typeof2["default"])(obj) !== "object") {
    return;
  }

  var newObj = decouple(obj, options); // Path has no dot-notation, set key/value

  if (isNonCompositePath(internalPath)) {
    var unescapedPath = unEscape(internalPath); // Do not allow prototype pollution

    if (unescapedPath === "__proto__") return obj;

    if (newObj.hasOwnProperty(unescapedPath)) {
      delete newObj[options.transformKey(unescapedPath)];
      return newObj;
    }

    tracking.returnOriginal = true;
    return obj;
  }

  var pathParts = split(internalPath);
  var pathPart = pathParts.shift();
  var transformedPathPart = options.transformKey(unEscape(pathPart)); // Do not allow prototype pollution

  if (transformedPathPart === "__proto__") return obj;
  var childPart = newObj[transformedPathPart];

  if (!childPart) {
    // No child part available, nothing to unset!
    tracking.returnOriginal = true;
    return obj;
  }

  newObj[transformedPathPart] = unSet(childPart, pathParts.join('.'), options, tracking);

  if (tracking.returnOriginal) {
    return obj;
  }

  return newObj;
}
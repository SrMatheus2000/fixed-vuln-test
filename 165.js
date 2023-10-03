function set(obj, path, val) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var internalPath = path,
      objPart;
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
  } // Path has no dot-notation, set key/value


  if (isNonCompositePath(internalPath)) {
    // Do not allow prototype pollution
    if (internalPath === "__proto__") return obj;
    obj = decouple(obj, options);
    obj[options.transformKey(unEscape(internalPath))] = val;
    return obj;
  }

  var newObj = decouple(obj, options);
  var pathParts = split(internalPath);
  var pathPart = pathParts.shift();
  var transformedPathPart = options.transformKey(pathPart); // Do not allow prototype pollution

  if (transformedPathPart === "__proto__") return obj;
  var childPart = newObj[transformedPathPart];

  if ((0, _typeof2["default"])(childPart) !== "object") {
    // Create an object or array on the path
    if (String(parseInt(transformedPathPart, 10)) === transformedPathPart) {
      // This is an array index
      newObj[transformedPathPart] = [];
    } else {
      newObj[transformedPathPart] = {};
    }

    objPart = newObj[transformedPathPart];
  } else {
    objPart = childPart;
  }

  return set(newObj, transformedPathPart, set(objPart, pathParts.join('.'), val, options), options);
}
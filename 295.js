function writeConfig(output, key, value, recurse) {
  if (!isLegalKey(key)) return;

  var k, o;
  if (isObject(value) && !isArray(value)) {
    o = isObject(output[key]) ? output[key] : (output[key] = {});
    for (k in value) {
      if (recurse && (recurse === true || recurse[k])) {
        writeConfig(o, k, value[k]);
      } else if (isLegalKey(k)) {
        o[k] = value[k];
      }
    }
  } else {
    output[key] = value;
  }
}
function baseExtend(args, merge) {
  var i, obj, src, key;
  var target = args[0];
  var length = args.length;

  for (i = 1; i < length; ++i) {

    obj = args[i];
    if ((obj === null || typeof obj !== 'object') && typeof obj !== 'function'){
      continue;
    }

    for (key in obj) {
      src = obj[key];
      if ((key === 'constructor' && typeof src === 'function') || key === '__proto__') {
        continue;
      }

      if (clonable(src)) {
        if (merge && clonable(target[key])) {
          baseExtend([target[key], src], merge);
        } else if (src !== undefined) {
          target[key] = baseExtend([{}, src], merge);
        }
      } else if (src !== undefined) {
        target[key] = Array.isArray(src) ? src.slice() : src;
      }
    }
  }
  return target;
}
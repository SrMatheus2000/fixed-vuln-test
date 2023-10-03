function unique_name_129(obj, path, val) {
  var segs = path.split('.');
  var attr = segs.pop();
  var src = obj;

  for (var i = 0; i < segs.length; i++) {
    var seg = segs[i];
    if (!isSafe(obj, seg)) return src;
    obj[seg] = obj[seg] || {};
    obj = obj[seg];
  }

  if (isSafe(obj, attr)) {
    obj[attr] = val;
  }

  return src;
}
function getSizeFromRatio(options) {
  var ratio = math.eval(options.ratio);
  return Math.floor(options.size * ratio);
}
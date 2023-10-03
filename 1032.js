function unique_name_605 (value) {
  if (!Buffer.isBuffer(value)) {
    value = new Buffer(value.toString());
  }
  var hex = value.toString('hex');

  return this.$hexify(hex);
}
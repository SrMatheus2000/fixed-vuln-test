function xor(a, b) {
  a = Buffer.from(a, 'binary');
  b = Buffer.from(b, 'binary');
  var result = Buffer.allocUnsafe(a.length);
  for (var i = 0; i < a.length; i++) {
    result[i] = (a[i] ^ b[i]);
  }
  return result;
}
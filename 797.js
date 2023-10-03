function unique_name_434() {
  var buffer = null;

  if (typeof this.scrambleBuff2 === 'undefined') {
    buffer = Buffer.from(this.scrambleBuff1);
  } else {
    buffer = Buffer.allocUnsafe(this.scrambleBuff1.length + this.scrambleBuff2.length);
    this.scrambleBuff1.copy(buffer, 0);
    this.scrambleBuff2.copy(buffer, this.scrambleBuff1.length);
  }

  return buffer;
}
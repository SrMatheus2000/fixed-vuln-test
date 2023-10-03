function unique_name_430(password) {
  var nr = [0x5030, 0x5735],
      add = 7,
      nr2 = [0x1234, 0x5671],
      result = Buffer.alloc(8);

  if (typeof password === 'string'){
    password = Buffer.from(password);
  }

  for (var i = 0; i < password.length; i++) {
    var c = password[i];
    if (c === 32 || c === 9) {
      // skip space in password
      continue;
    }

    // nr^= (((nr & 63)+add)*c)+ (nr << 8);
    // nr = xor(nr, add(mul(add(and(nr, 63), add), c), shl(nr, 8)))
    nr = this.xor32(nr, this.add32(this.mul32(this.add32(this.and32(nr, [0,63]), [0,add]), [0,c]), this.shl32(nr, 8)));

    // nr2+=(nr2 << 8) ^ nr;
    // nr2 = add(nr2, xor(shl(nr2, 8), nr))
    nr2 = this.add32(nr2, this.xor32(this.shl32(nr2, 8), nr));

    // add+=tmp;
    add += c;
  }

  this.int31Write(result, nr, 0);
  this.int31Write(result, nr2, 4);

  return result;
}
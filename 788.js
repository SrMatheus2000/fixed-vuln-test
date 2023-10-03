function unique_name_431(message, password) {
  var to = Buffer.allocUnsafe(8),
      hashPass = this.hashPassword(password),
      hashMessage = this.hashPassword(message.slice(0, 8)),
      seed1 = this.int32Read(hashPass, 0) ^ this.int32Read(hashMessage, 0),
      seed2 = this.int32Read(hashPass, 4) ^ this.int32Read(hashMessage, 4),
      r = this.randomInit(seed1, seed2);

  for (var i = 0; i < 8; i++){
    to[i] = Math.floor(this.myRnd(r) * 31) + 64;
  }
  var extra = (Math.floor(this.myRnd(r) * 31));

  for (var i = 0; i < 8; i++){
    to[i] ^= extra;
  }

  return to;
}
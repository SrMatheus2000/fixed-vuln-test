function unique_name_307 (cookie, isSignedCookie, next) {
  if (!cookie) {
    return next(new Error('cookie was empty.'))
  }

  var cookieSegments = cookie.split('--');
  if (cookieSegments.length != 2) {
    return next(new Error('invalid cookie format.'));
  }

  var sessionData = new Buffer.from(cookieSegments[0], 'base64');
  var signature = cookieSegments[1];

  if (isSignedCookie) {
    var hmacKey = crypto.pbkdf2Sync(this.secret, this.signedCookieSalt, this.iterations, this.keyLength, this.digest);
    var hmac = crypto.createHmac('sha1', hmacKey);
    hmac.update(cookieSegments[0]);
    var hmacSignature = hmac.digest('hex');
    if (signature !== hmacSignature) {
      return next(new Error('invalid cookie signature.'), null);
    }
  }

  var sessionDataSegments = sessionData.toString('utf8').split('--');
  if (sessionDataSegments.length != 2) {
    return next(new Error('invalid cookie format.'));
  }

  var data = new Buffer.from(sessionDataSegments[0], 'base64');
  var iv = new Buffer.from(sessionDataSegments[1], 'base64');

  crypto.pbkdf2(this.secret, this.cookieSalt, this.iterations, this.keyLength, this.digest, function(err, derivedKey) {
    if (err) return next(err);

    try {
      var decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey.slice(0, 32), iv.slice(0, 16));
      var decryptedData = decipher.update(data, 'binary', 'utf8') + decipher.final('utf8');

      next(null, decryptedData);
    } catch(e) {
      next(e);
    }
  });
}
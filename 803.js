function verifyHMAC(parsedSignature, secret) {
    assert.object(parsedSignature, 'parsedHMAC');
    assert.string(secret, 'secret');

    var alg = parsedSignature.algorithm.match(/^HMAC-(\w+)/);
    if (!alg || alg.length !== 2)
      throw new TypeError('parsedSignature: unsupported algorithm ' +
                          parsedSignature.algorithm);
    var hashAlg = alg[1].toUpperCase();

    var hmac = crypto.createHmac(hashAlg, secret);
    hmac.update(parsedSignature.signingString);

    /*
     * Now double-hash to avoid leaking timing information - there's
     * no easy constant-time compare in JS, so we use this approach
     * instead. See for more info:
     * https://www.isecpartners.com/blog/2011/february/double-hmac-
     * verification.aspx
     */
    var h1 = crypto.createHmac(hashAlg, secret);
    h1.update(hmac.digest());
    var h2 = crypto.createHmac(hashAlg, secret);
    h2.update(new Buffer(parsedSignature.params.signature, 'base64'));

    return (h1.digest().equals(h2.digest()));
  }
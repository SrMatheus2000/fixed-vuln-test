function signRequest(request, options) {
    assert.object(request, 'request');
    assert.object(options, 'options');
    assert.optionalString(options.algorithm, 'options.algorithm');
    assert.string(options.keyId, 'options.keyId');
    assert.optionalArrayOfString(options.headers, 'options.headers');

    if (!request.getHeader('Date'))
      request.setHeader('Date', _rfc1123());
    if (!options.headers)
      options.headers = ['date'];
    if (!options.algorithm)
      options.algorithm = 'rsa-sha256';

    options.algorithm = options.algorithm.toLowerCase();

    if (!Algorithms[options.algorithm])
      throw new InvalidAlgorithmError(options.algorithm + ' is not supported');

    var i;
    var stringToSign = '';
    for (i = 0; i < options.headers.length; i++) {
      if (typeof (options.headers[i]) !== 'string')
        throw new TypeError('options.headers must be an array of Strings');

      var h = options.headers[i].toLowerCase();

      if (h !== 'request-line') {
        var value = request.getHeader(h);
        if (!value) {
          throw new MissingHeaderError(h + ' was not in the request');
        }
        stringToSign += h + ': ' + value;
      } else {
        value =
        stringToSign += request.method + ' ' + request.path + ' HTTP/1.1';
      }

      if ((i + 1) < options.headers.length)
        stringToSign += '\n';
    }

    var alg = options.algorithm.match(/(hmac|rsa)-(\w+)/);
    var signature;
    if (alg[1] === 'hmac') {
      var hmac = crypto.createHmac(alg[2].toUpperCase(), options.key);
      hmac.update(stringToSign);
      signature = hmac.digest('base64');
    } else {
      var signer = crypto.createSign(options.algorithm.toUpperCase());
      signer.update(stringToSign);
      signature = signer.sign(options.key, 'base64');
    }

    request.setHeader('Authorization', sprintf(Authorization,
                                               options.keyId,
                                               options.algorithm,
                                               options.headers.join(' '),
                                               signature));

    return true;
  }
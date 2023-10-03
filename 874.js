function unique_name_491(key, props) {
    key = key || {};
    props = props || {};

    var keyLen = props.length || 0,
        algParams = merge(clone(alg), {
          namedCurve: key.crv
        });

    // assume {key} is privateKey
    if (!keyLen) {
      // calculate key length from private key size
      keyLen = key.d.length;
    }
    var privKey = ecUtil.convertToJWK(key, false);
    privKey = helpers.subtleCrypto.importKey("jwk",
                                             privKey,
                                             algParams,
                                             false,
                                             [ "deriveBits" ]);

    // assume {props.public} is publicKey
    var pubKey = validatePublic(props.public, "jwk");
    pubKey = pubKey.then(function(pubKey) {
      // {pubKey} is "jwk"
      return helpers.subtleCrypto.importKey("jwk",
                                            pubKey,
                                            algParams,
                                            false,
                                            []);
    });

    var p = Promise.all([privKey, pubKey]);
    p = p.then(function(keypair) {
      var privKey = keypair[0],
          pubKey = keypair[1];

      var algParams = merge(clone(alg), {
        public: pubKey
      });
      return helpers.subtleCrypto.deriveBits(algParams, privKey, keyLen * 8);
    });
    p = p.then(function(result) {
      result = new Buffer(result);
      return result;
    });
    return p;
  }
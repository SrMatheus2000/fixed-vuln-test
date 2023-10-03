function ecdhDeriveFn() {
  var alg = {
    name: "ECDH"
  };

  var validatePublic = function(pk, form) {
    var pubKey = pk && ecUtil.convertToForge(pk, true);
    if (!pubKey || !pubKey.isValid()) {
      return Promise.reject(new Error("invalid EC public key"));
    }

    switch (form) {
      case "jwk":
        pubKey = ecUtil.convertToJWK(pk, true);
        break;
      case "buffer":
        pubKey = ecUtil.convertToBuffer(pk, true);
        break;
    }
    return Promise.resolve(pubKey);
  }

  // ### fallback implementation -- uses ecc + forge
  var fallback = function(key, props) {
    props = props || {};
    var keyLen = props.length || 0;
    // assume {key} is privateKey
    // assume {props.public} is publicKey
    var privKey = ecUtil.convertToForge(key, false);

    var p = validatePublic(props.public, "forge");
    p = p.then(function(pubKey) {
      // {pubKey} is "forge"

      var secret = privKey.computeSecret(pubKey);
      if (keyLen) {
        // truncate to requested key length
        if (secret.length < keyLen) {
          return Promise.reject(new Error("key length too large: " + keyLen));
        }
        secret = secret.slice(0, keyLen);
      }

      return secret;
    });
    return p;
  };

  // ### WebCryptoAPI implementation
  // TODO: cache CryptoKey sooner
  var webcrypto = function(key, props) {
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
  };

  var nodejs = function(key, props) {
    if ("function" !== typeof helpers.nodeCrypto.createECDH) {
      throw new Error("unsupported algorithm: ECDH");
    }

    props = props || {};
    var keyLen = props.length || 0;
    var curve;
    switch (key.crv) {
      case "P-256":
        curve = "prime256v1";
        break;
      case "P-384":
        curve = "secp384r1";
        break;
      case "P-521":
        curve = "secp521r1";
        break;
      default:
        return Promise.reject(new Error("invalid curve: " + curve));
    }

    // assume {key} is privateKey
    // assume {props.public} is publicKey
    var privKey = ecUtil.convertToBuffer(key, false);

    var p = validatePublic(props.public, "buffer");
    p = p.then(function(pubKey) {
      // {pubKey} is "buffer"
      var ecdh = helpers.nodeCrypto.createECDH(curve);
      // dummy call so computeSecret doesn't fail
      // ecdh.generateKeys();
      ecdh.setPrivateKey(privKey);
      var secret = ecdh.computeSecret(pubKey);
      if (keyLen) {
        if (secret.length < keyLen) {
          return Promise.reject(new Error("key length too large: " + keyLen));
        }
        secret = secret.slice(0, keyLen);
      }
      return secret;
    });
    return p;
  };

  return helpers.setupFallback(nodejs, webcrypto, fallback);
}
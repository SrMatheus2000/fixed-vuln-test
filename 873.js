function unique_name_490(key, props) {
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
  }
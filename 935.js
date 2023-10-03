function _startTLS(onSecure) {
    // before TLS:
    //  _socket <-> _protocol
    // after:
    //  _socket <-> securePair.encrypted <-> securePair.cleartext <-> _protocol

    var credentials = Crypto.createCredentials({
      key        : this.config.ssl.key,
      cert       : this.config.ssl.cert,
      passphrase : this.config.ssl.passphrase,
      ca         : this.config.ssl.ca
    });

    var rejectUnauthorized = this.config.ssl.rejectUnauthorized;
    var securePair         = tls.createSecurePair(credentials, false, true, rejectUnauthorized);

    // "unpipe"
    this._socket.removeAllListeners('data');
    this._protocol.removeAllListeners('data');

    // socket <-> encrypted
    securePair.encrypted.pipe(this._socket);
    this._socket.on('data', function(data) {
      securePair.encrypted.write(data);
    });

    // cleartext <-> protocol
    securePair.cleartext.pipe(this._protocol);
    this._protocol.on('data', function(data) {
      securePair.cleartext.write(data);
    });

    securePair.on('secure', function() {
      onSecure(rejectUnauthorized ? this.ssl.verifyError() : null);
    });
  }
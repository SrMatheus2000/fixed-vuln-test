function _startTLS(onSecure) {
    var secureContext = tls.createSecureContext({
      key        : this.config.ssl.key,
      cert       : this.config.ssl.cert,
      passphrase : this.config.ssl.passphrase,
      ca         : this.config.ssl.ca
    });

    // "unpipe"
    this._socket.removeAllListeners('data');
    this._protocol.removeAllListeners('data');

    // socket <-> encrypted
    var rejectUnauthorized = this.config.ssl.rejectUnauthorized;
    var secureSocket       = new tls.TLSSocket(this._socket, {
      rejectUnauthorized : rejectUnauthorized,
      requestCert        : true,
      secureContext      : secureContext,
      isServer           : false
    });

    // cleartext <-> protocol
    secureSocket.pipe(this._protocol);
    this._protocol.on('data', function(data) {
      secureSocket.write(data);
    });

    secureSocket.on('secure', function() {
      onSecure(rejectUnauthorized ? this.ssl.verifyError() : null);
    });

    // start TLS communications
    secureSocket._start();
  }
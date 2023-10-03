async function start(options = {}) {
    await new Promise(async resolve => {
      if (!options.https) {
        this.server = http.createServer();
      } else if (typeof options.https === 'boolean') {
        this.server = https.createServer(generateCertificate(options));
      } else {
        this.server = https.createServer(await getCertificate(options.https));
      }

      let websocketOptions = {
        server: this.server
      };

      if (options.hmrHostname) {
        websocketOptions.origin = `${options.https ? 'https' : 'http'}://${
          options.hmrHostname
        }`;
      }

      this.wss = new WebSocket.Server(websocketOptions);
      this.server.listen(options.hmrPort, resolve);
    });

    this.wss.on('connection', ws => {
      ws.onerror = this.handleSocketError;
      if (this.unresolvedError) {
        ws.send(JSON.stringify(this.unresolvedError));
      }
    });

    this.wss.on('error', this.handleSocketError);

    return this.wss._server.address().port;
  }